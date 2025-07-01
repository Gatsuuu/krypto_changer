package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
)

type CoinGeckoResponse struct {
	Prices [][]float64 `json:"prices"`
}

func getCoinData(c *gin.Context) {
	coin := c.DefaultQuery("coin", "ripple")
	days := c.DefaultQuery("days", "1") // читаем параметр days из query

	apiURL := "https://api.coingecko.com/api/v3/coins/" + coin + "/market_chart?vs_currency=usd&days=" + days
	resp, err := http.Get(apiURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var cgResp CoinGeckoResponse
	if err := json.Unmarshal(body, &cgResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid response"})
		return
	}
	fmt.Println("Запрос:", apiURL)

	// Возвращаем только цены
	c.JSON(http.StatusOK, cgResp.Prices)
}

func main() {
	r := gin.Default()
	r.Use(cors.Default())
	r.GET("/api/coin", getCoinData)
	r.Run(":8080")
}
