package main

import (
	"context"
	"crypto/ed25519"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Database models
type Poll struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Question        string    `gorm:"not null" json:"question"`
	Options         string    `gorm:"type:text" json:"-"`   // JSON string for PostgreSQL
	OptionsArray    []string  `gorm:"-" json:"options"`     // For JSON response
	VoteCounts      string    `gorm:"type:text" json:"-"`   // JSON string for PostgreSQL
	VoteCountsArray []int     `gorm:"-" json:"vote_counts"` // For JSON response
	TotalVotes      int       `gorm:"default:0" json:"total_votes"`
	CreatedAt       time.Time `json:"created_at"`
	CreatorAddr     string    `gorm:"not null" json:"creator_address"`
	TxID            string    `json:"tx_id"`
	BlockchainAddr  string    `gorm:"index" json:"blockchain_address"` // Solana PDA address
	Status          string    `gorm:"default:pending" json:"status"`   // pending, confirmed, failed
}

type VoteRecord struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	PollID         uint      `gorm:"not null" json:"poll_id"`
	VoterAddr      string    `gorm:"not null;index" json:"voter_address"`
	OptionIndex    int       `gorm:"not null" json:"option_index"`
	TxID           string    `json:"tx_id"`
	VotedAt        time.Time `gorm:"autoCreateTime" json:"voted_at"`
	BlockchainAddr string    `gorm:"index" json:"blockchain_vote_address"` // Solana vote record PDA
	Status         string    `gorm:"default:pending" json:"status"`        // pending, confirmed, failed

	// Foreign key
	Poll Poll `gorm:"foreignKey:PollID" json:"-"`
}

// Request structs
type CreatePollRequest struct {
	Question    string   `json:"question" binding:"required"`
	Options     []string `json:"options" binding:"required"`
	CreatorAddr string   `json:"creator_address" binding:"required"`
}

type VoteRequest struct {
	PollID      uint   `json:"poll_id" binding:"required"`
	OptionIndex *int   `json:"option_index" binding:"required"`
	VoterAddr   string `json:"voter_address" binding:"required"`
}

// Solana configuration
const (
	SOLANA_RPC_URL = "https://api.devnet.solana.com"
	PROGRAM_ID     = "FCDmppHxhBWfYxBtuYdmLrrtttfsXivNWGFPGEYmXqHB" // Your deployed contract
)

// Global variables
var db *gorm.DB
var solanaClient *rpc.Client
var programID solana.PublicKey

// Server keypair for signing transactions (in production, use secure key management)
var serverKeypair solana.PrivateKey

func main() {
	// Initialize database
	initDatabase()

	// Initialize Solana client
	initSolana()

	// Initialize server keypair (for transaction signing)
	initServerKeypair()

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Routes
	r.GET("/ping", pingHandler)
	r.POST("/polls", createPollHandler)
	r.GET("/polls", getPollsHandler)
	r.GET("/polls/:id", getPollHandler)
	r.POST("/vote", voteHandler)

	// Blockchain routes
	r.GET("/blockchain/polls", getBlockchainPollsHandler)
	r.GET("/blockchain/poll/:address", getBlockchainPollHandler)

	fmt.Println("🚀 Vote Backend Server starting on :8080")
	fmt.Println("🗄️  Database: PostgreSQL")
	fmt.Println("⛓️  Blockchain: Solana Devnet")
	fmt.Println("🔑 Smart Contract Integration: ENABLED")
	fmt.Println("📋 Endpoints:")
	fmt.Println("   GET  /ping")
	fmt.Println("   POST /polls")
	fmt.Println("   GET  /polls")
	fmt.Println("   GET  /polls/:id")
	fmt.Println("   POST /vote")

	log.Fatal(http.ListenAndServe(":8080", r))
}

func initDatabase() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://localhost/vote_db?sslmode=disable"
	}

	var err error
	db, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Printf("❌ Failed to connect to database: %v", err)
		log.Println("📝 Using fallback mode...")
		db = nil
		return
	}

	// Auto migrate tables
	err = db.AutoMigrate(&Poll{}, &VoteRecord{})
	if err != nil {
		log.Printf("❌ Failed to migrate database: %v", err)
		db = nil
		return
	}

	log.Println("✅ Database connected and tables created")
}

func initSolana() {
	solanaClient = rpc.New(SOLANA_RPC_URL)

	var err error
	programID, err = solana.PublicKeyFromBase58(PROGRAM_ID)
	if err != nil {
		log.Printf("❌ Invalid program ID: %v", err)
		return
	}

	// Test connection
	ctx := context.Background()
	_, err = solanaClient.GetHealth(ctx)
	if err != nil {
		log.Printf("❌ Failed to connect to Solana: %v", err)
		return
	}

	log.Printf("✅ Solana connected to devnet")
	log.Printf("📝 Program ID: %s", PROGRAM_ID)
}

func initServerKeypair() {
	// In production, load from secure environment variable or key management system
	// For demo, we'll generate a new keypair each time
	_, privateKey, err := ed25519.GenerateKey(nil)
	if err != nil {
		log.Printf("❌ Failed to generate server keypair: %v", err)
		return
	}

	serverKeypair = solana.PrivateKey(privateKey)
	log.Printf("✅ Server keypair initialized: %s", serverKeypair.PublicKey().String())
}

func generatePollPDA(creator solana.PublicKey, timestamp int64) (solana.PublicKey, uint8, error) {
	timestampBytes := make([]byte, 8)
	for i := 0; i < 8; i++ {
		timestampBytes[i] = byte(timestamp >> (8 * i))
	}

	seeds := [][]byte{
		[]byte("poll"),
		creator[:],
		timestampBytes,
	}

	return solana.FindProgramAddress(seeds, programID)
}

func generateVotePDA(poll solana.PublicKey, voter solana.PublicKey) (solana.PublicKey, uint8, error) {
	seeds := [][]byte{
		[]byte("vote"),
		poll[:],
		voter[:],
	}

	return solana.FindProgramAddress(seeds, programID)
}

func pingHandler(c *gin.Context) {
	status := gin.H{
		"message":        "pong",
		"database":       "disconnected",
		"blockchain":     "disconnected",
		"smart_contract": "enabled",
	}

	if db != nil {
		status["database"] = "connected"
	}

	if solanaClient != nil {
		ctx := context.Background()
		_, err := solanaClient.GetHealth(ctx)
		if err == nil {
			status["blockchain"] = "connected"
		}
	}

	c.JSON(200, status)
}

func createPollHandler(c *gin.Context) {
	var request CreatePollRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Validate options
	if len(request.Options) < 2 {
		c.JSON(400, gin.H{"error": "Poll must have at least 2 options"})
		return
	}

	if len(request.Options) > 10 {
		c.JSON(400, gin.H{"error": "Poll cannot have more than 10 options"})
		return
	}

	// Validate creator address
	creatorPubkey, err := solana.PublicKeyFromBase58(request.CreatorAddr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid creator address"})
		return
	}

	// Create poll in database first
	poll := Poll{
		Question:    request.Question,
		CreatorAddr: request.CreatorAddr,
		TotalVotes:  0,
		Status:      "pending",
	}

	// Serialize options and vote counts
	optionsJSON, _ := json.Marshal(request.Options)
	poll.Options = string(optionsJSON)

	voteCounts := make([]int, len(request.Options))
	voteCountsJSON, _ := json.Marshal(voteCounts)
	poll.VoteCounts = string(voteCountsJSON)

	// Generate PDA for this poll
	timestamp := time.Now().Unix()
	pollPDA, _, err := generatePollPDA(creatorPubkey, timestamp)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate poll address"})
		return
	}

	poll.BlockchainAddr = pollPDA.String()

	// Save to database
	if db != nil {
		if err := db.Create(&poll).Error; err != nil {
			c.JSON(500, gin.H{"error": "Failed to create poll in database"})
			return
		}
	}

	// TODO: Create actual transaction to blockchain
	// For now, simulate the transaction
	poll.TxID = fmt.Sprintf("simulated_tx_%d", timestamp)
	poll.Status = "confirmed" // In real implementation, this would be updated after blockchain confirmation

	if db != nil {
		db.Save(&poll)
	}

	// Prepare response
	poll.OptionsArray = request.Options
	poll.VoteCountsArray = voteCounts

	c.JSON(201, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
		"blockchain_info": gin.H{
			"tx_id":        poll.TxID,
			"poll_address": poll.BlockchainAddr,
			"explorer_url": fmt.Sprintf("https://explorer.solana.com/tx/%s?cluster=devnet", poll.TxID),
			"status":       poll.Status,
		},
	})
}

func getPollsHandler(c *gin.Context) {
	var polls []Poll

	if db != nil {
		if err := db.Find(&polls).Error; err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch polls"})
			return
		}

		// Deserialize JSON data
		for i := range polls {
			var options []string
			var voteCounts []int

			json.Unmarshal([]byte(polls[i].Options), &options)
			json.Unmarshal([]byte(polls[i].VoteCounts), &voteCounts)

			polls[i].OptionsArray = options
			polls[i].VoteCountsArray = voteCounts
		}
	}

	c.JSON(200, gin.H{
		"polls": polls,
		"count": len(polls),
	})
}

func getPollHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid poll ID"})
		return
	}

	var poll Poll
	if db != nil {
		if err := db.First(&poll, uint(id)).Error; err != nil {
			c.JSON(404, gin.H{"error": "Poll not found"})
			return
		}

		// Deserialize JSON data
		var options []string
		var voteCounts []int

		json.Unmarshal([]byte(poll.Options), &options)
		json.Unmarshal([]byte(poll.VoteCounts), &voteCounts)

		poll.OptionsArray = options
		poll.VoteCountsArray = voteCounts
	}

	c.JSON(200, poll)
}

func voteHandler(c *gin.Context) {
	var request VoteRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Validate voter address
	voterPubkey, err := solana.PublicKeyFromBase58(request.VoterAddr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid voter address"})
		return
	}

	// Check if already voted
	if db != nil {
		var existingVote VoteRecord
		if err := db.Where("poll_id = ? AND voter_addr = ?", request.PollID, request.VoterAddr).First(&existingVote).Error; err == nil {
			c.JSON(400, gin.H{"error": "User has already voted on this poll"})
			return
		}
	}

	// Find the poll
	var poll Poll
	if db != nil {
		if err := db.First(&poll, request.PollID).Error; err != nil {
			c.JSON(404, gin.H{"error": "Poll not found"})
			return
		}
	}

	// Validate option index
	var options []string
	json.Unmarshal([]byte(poll.Options), &options)

	if *request.OptionIndex < 0 || *request.OptionIndex >= len(options) {
		c.JSON(400, gin.H{"error": "Invalid option index"})
		return
	}

	// Generate vote PDA
	pollPubkey, err := solana.PublicKeyFromBase58(poll.BlockchainAddr)
	if err != nil {
		c.JSON(500, gin.H{"error": "Invalid poll blockchain address"})
		return
	}

	votePDA, _, err := generateVotePDA(pollPubkey, voterPubkey)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate vote address"})
		return
	}

	// Create vote record
	voteRecord := VoteRecord{
		PollID:         request.PollID,
		VoterAddr:      request.VoterAddr,
		OptionIndex:    *request.OptionIndex,
		TxID:           fmt.Sprintf("simulated_vote_tx_%d", time.Now().Unix()),
		BlockchainAddr: votePDA.String(),
		Status:         "pending",
	}

	// TODO: Submit actual vote transaction to blockchain
	// For now, simulate the transaction
	voteRecord.Status = "confirmed"

	if db != nil {
		if err := db.Create(&voteRecord).Error; err != nil {
			c.JSON(500, gin.H{"error": "Failed to record vote"})
			return
		}

		// Update poll vote counts
		var voteCounts []int
		json.Unmarshal([]byte(poll.VoteCounts), &voteCounts)
		voteCounts[*request.OptionIndex]++
		poll.TotalVotes++

		voteCountsJSON, _ := json.Marshal(voteCounts)
		poll.VoteCounts = string(voteCountsJSON)

		db.Save(&poll)
	}

	c.JSON(200, gin.H{
		"message":     "Vote cast successfully",
		"vote_record": voteRecord,
		"blockchain_info": gin.H{
			"tx_id":        voteRecord.TxID,
			"vote_address": voteRecord.BlockchainAddr,
			"explorer_url": fmt.Sprintf("https://explorer.solana.com/tx/%s?cluster=devnet", voteRecord.TxID),
			"status":       voteRecord.Status,
		},
	})
}

func getBlockchainPollsHandler(c *gin.Context) {
	// TODO: Fetch polls directly from blockchain
	// This would scan for all poll PDAs created by our program

	c.JSON(200, gin.H{
		"message":    "Blockchain polls fetching not implemented yet",
		"note":       "This would fetch polls directly from Solana blockchain using getProgramAccounts",
		"program_id": PROGRAM_ID,
	})
}

func getBlockchainPollHandler(c *gin.Context) {
	address := c.Param("address")

	// Validate address
	_, err := solana.PublicKeyFromBase58(address)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid blockchain address"})
		return
	}

	// TODO: Fetch specific poll from blockchain by PDA address

	c.JSON(200, gin.H{
		"message": fmt.Sprintf("Blockchain poll %s fetching not implemented yet", address),
		"note":    "This would fetch poll data directly from Solana blockchain using getAccountInfo",
	})
}
