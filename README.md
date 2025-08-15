# 🌟 Aeneid Validator Nexus

**A comprehensive validator monitoring and analytics platform for the Story Protocol testnet network.**

![Story Protocol](https://img.shields.io/badge/Story%20Protocol-Testnet-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Telegram%20Bot-green?style=for-the-badge&logo=node.js)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Telegram Bot](#telegram-bot)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Aeneid Validator Nexus is a modern, comprehensive monitoring platform designed specifically for Story Protocol testnet validators. It provides real-time insights, geographic visualization, performance analytics, and automated alerting to help validators maintain optimal network participation.

### 🌐 Live Demo
- **Web Dashboard**: [Your deployment URL]
- **Telegram Bot**: [@YourBotName](https://t.me/YourBotName)

## ✨ Features

### 🖥️ Web Dashboard
- **Real-time Validator Monitoring** - Live uptime tracking and performance metrics
- **Interactive World Map** - Geographic distribution of validators with location data
- **Validator Explorer** - Comprehensive validator profiles and detailed analytics
- **Network Analytics** - Network-wide statistics and tokenomics data
- **Validator Comparison** - Side-by-side validator performance analysis
- **Responsive Design** - Mobile-friendly interface with dark theme

### 📱 Telegram Bot
- **Real-time Alerts** - Instant notifications for missed blocks, jailing, and slashing
- **Subscription Management** - Easy validator monitoring with persistent button interface
- **Custom Alert Thresholds** - Configurable missed block alerts per validator
- **Interactive Menu** - User-friendly button-based navigation
- **Multi-user Support** - Individual subscriptions and alert preferences

### 📊 Key Metrics Tracked
- **Uptime Percentage** - Last 60 blocks and all-time uptime statistics
- **Block Signing** - Signed vs missed blocks with visual indicators
- **Validator Status** - Active, inactive, jailed, or slashed status
- **Delegator Information** - Delegator count and stake distribution
- **Commission Details** - Current rates and historical changes
- **EVM Integration** - EVM address transaction data and balances
- **Network Tokenomics** - Total supply, bonded tokens, and distribution

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Shadcn/ui** components for consistent UI design
- **Leaflet** for interactive map visualization
- **React Query** for efficient data fetching and caching

### Backend Services
- **Express.js Proxy Server** - CORS handling and API aggregation
- **Node.js Telegram Bot** - Real-time monitoring and alerts
- **SQLite Database** - User subscriptions and alert preferences
- **REST API Integration** - Story Protocol and ITRocket APIs

### Data Sources
- **Story Protocol API** (`api-aeneid.storyscan.app`) - Primary validator data
- **ITRocket API** (`api-story-testnet.itrocket.net`) - Slashing and signing info
- **IP Geolocation APIs** - Validator geographic distribution

