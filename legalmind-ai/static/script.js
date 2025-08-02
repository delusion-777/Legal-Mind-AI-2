// Global variables
let currentAudioUrl = null
let isPlaying = false

// DOM Elements
const tabButtons = document.querySelectorAll(".tab-button")
const tabContents = document.querySelectorAll(".tab-content")
const toastContainer = document.getElementById("toastContainer")

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeTabs()
  initializeFileUploads()
  initializeForms()
  initializeChat()
  updateCharCount()
})

// Tab functionality
function initializeTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab")
      switchTab(tabId)
    })
  })
}

function switchTab(tabId) {
  // Update buttons
  tabButtons.forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active")

  // Update content
  tabContents.forEach((content) => content.classList.remove("active"))
  document.getElementById(tabId).classList.add("active")
}

// File upload functionality
function initializeFileUploads() {
  // Analyze file upload
  const analyzeFileUpload = document.getElementById("analyzeFileUpload")
  const analyzeFileInput = document.getElementById("analyzeFile")

  analyzeFileUpload.addEventListener("click", () => analyzeFileInput.click())
  analyzeFileInput.addEventListener("change", (e) => updateFileDisplay(e, "analyze"))

  // Summarize file upload
  const summarizeFileUpload = document.getElementById("summarizeFileUpload")
  const summarizeFileInput = document.getElementById("summarizeFile")

  summarizeFileUpload.addEventListener("click", () => summarizeFileInput.click())
  summarizeFileInput.addEventListener("change", (e) => updateFileDisplay(e, "summarize"))
}

function updateFileDisplay(event, type) {
  const file = event.target.files[0]
  const fileNameElement = document.querySelector(`#${type}FileUpload .file-name`)
  const fileSizeElement = document.querySelector(`#${type}FileUpload .file-size`)

  if (file) {
    fileNameElement.textContent = file.name
    if (fileSizeElement) {
      fileSizeElement.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`
    }

    // Validate file size
    if (file.size > 50 * 1024 * 1024) {
      showToast("File too large", "Please select a file smaller than 50MB", "error")
      event.target.value = ""
      fileNameElement.textContent = "Choose file to upload"
      if (fileSizeElement) fileSizeElement.textContent = "No file chosen"
    }
  }
}

// Form handling
function initializeForms() {
  // Document Analyzer Form
  document.getElementById("analyzeForm").addEventListener("submit", handleAnalyzeSubmit)

  // Document Summarizer Form
  document.getElementById("summarizeForm").addEventListener("submit", handleSummarizeSubmit)

  // Text-to-Speech Form
  document.getElementById("ttsForm").addEventListener("submit", handleTTSSubmit)

  // Character count for TTS
  document.getElementById("ttsText").addEventListener("input", updateCharCount)
}

async function handleAnalyzeSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const file = formData.get("file")

  if (!file || file.size === 0) {
    showToast("No file selected", "Please select a file to analyze", "error")
    return
  }

  const btn = document.getElementById("analyzeBtn")
  const btnText = btn.querySelector(".btn-text")
  const btnLoading = btn.querySelector(".btn-loading")

  // Show loading state
  btnText.classList.add("hide")
  btnLoading.classList.add("show")
  btn.disabled = true

  try {
    const response = await fetch("/api/analyze-document", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Analysis failed")
    }

    const result = await response.json()

    // Show results
    document.getElementById("analyzeOutput").textContent = result.analysis
    document.getElementById("analyzeResults").classList.remove("hidden")

    showToast("Analysis Complete", "Your document has been analyzed successfully", "success")
  } catch (error) {
    console.error("Analysis error:", error)
    showToast("Analysis Failed", "There was an error analyzing your document", "error")
  } finally {
    // Reset button state
    btnText.classList.remove("hide")
    btnLoading.classList.remove("show")
    btn.disabled = false
  }
}

async function handleSummarizeSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const file = formData.get("file")
  const text = formData.get("text")

  if ((!file || file.size === 0) && !text.trim()) {
    showToast("No content provided", "Please upload a file or enter text to summarize", "error")
    return
  }

  const btn = document.getElementById("summarizeBtn")
  const btnText = btn.querySelector(".btn-text")
  const btnLoading = btn.querySelector(".btn-loading")

  // Show loading state
  btnText.classList.add("hide")
  btnLoading.classList.add("show")
  btn.disabled = true

  try {
    const response = await fetch("/api/summarize-document", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Summarization failed")
    }

    const result = await response.json()

    // Show results
    document.getElementById("summarizeOutput").textContent = result.summary
    document.getElementById("summarizeResults").classList.remove("hidden")

    showToast("Summarization Complete", "Your document has been summarized successfully", "success")
  } catch (error) {
    console.error("Summarization error:", error)
    showToast("Summarization Failed", "There was an error summarizing your document", "error")
  } finally {
    // Reset button state
    btnText.classList.remove("hide")
    btnLoading.classList.remove("show")
    btn.disabled = false
  }
}

async function handleTTSSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const text = formData.get("text")

  if (!text.trim()) {
    showToast("No text provided", "Please enter text to convert to speech", "error")
    return
  }

  const btn = document.getElementById("ttsBtn")
  const btnText = btn.querySelector(".btn-text")
  const btnLoading = btn.querySelector(".btn-loading")

  // Show loading state
  btnText.classList.add("hide")
  btnLoading.classList.add("show")
  btn.disabled = true

  try {
    const response = await fetch("/api/text-to-speech", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("TTS generation failed")
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    // Update audio player
    const audioPlayer = document.getElementById("audioPlayer")
    audioPlayer.src = audioUrl
    currentAudioUrl = audioUrl

    // Show results
    document.getElementById("ttsResults").classList.remove("hidden")

    // Setup download button
    document.getElementById("downloadBtn").onclick = () => {
      const a = document.createElement("a")
      a.href = audioUrl
      a.download = "echo-verse-audio.wav"
      a.click()
    }

    showToast("Speech Generated", "Your text has been converted to speech successfully", "success")
  } catch (error) {
    console.error("TTS error:", error)
    showToast("Generation Failed", "There was an error generating speech", "error")
  } finally {
    // Reset button state
    btnText.classList.remove("hide")
    btnLoading.classList.remove("show")
    btn.disabled = false
  }
}

function updateCharCount() {
  const textArea = document.getElementById("ttsText")
  const charCount = document.getElementById("charCount")
  if (textArea && charCount) {
    charCount.textContent = textArea.value.length
  }
}

// Chat functionality
function initializeChat() {
  const chatInput = document.getElementById("chatInput")
  const sendBtn = document.getElementById("sendBtn")
  const quickBtns = document.querySelectorAll(".quick-btn")

  sendBtn.addEventListener("click", sendMessage)
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  quickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const question = btn.getAttribute("data-question")
      chatInput.value = question
      sendMessage()
    })
  })

  // Add initial timestamp
  updateMessageTime()
}

async function sendMessage() {
  const chatInput = document.getElementById("chatInput")
  const message = chatInput.value.trim()

  if (!message) return

  // Add user message
  addMessage(message, true)
  chatInput.value = ""

  // Show typing indicator
  const typingIndicator = addTypingIndicator()

  try {
    const formData = new FormData()
    formData.append("message", message)
    formData.append("context", "General legal consultation")

    const response = await fetch("/api/chat-legal-advisor", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    // Remove typing indicator
    typingIndicator.remove()

    // Add AI response
    addMessage(result.answer, false)

    if (result.disclaimer) {
      showToast("Legal Disclaimer", result.disclaimer, "warning")
    }
  } catch (error) {
    console.error("Chat error:", error)

    // Remove typing indicator
    typingIndicator.remove()

    // Add fallback response
    const fallbackResponse = generateFallbackResponse(message)
    addMessage(fallbackResponse, false)

    showToast("Offline Mode", "Using local legal information database", "warning")
  }
}

function addMessage(text, isUser) {
  const chatMessages = document.getElementById("chatMessages")
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`

  const now = new Date()
  const timeString = now.toLocaleTimeString()

  messageDiv.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">${timeString}</span>
        </div>
    `

  chatMessages.appendChild(messageDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function addTypingIndicator() {
  const chatMessages = document.getElementById("chatMessages")
  const typingDiv = document.createElement("div")
  typingDiv.className = "message ai-message"
  typingDiv.innerHTML = `
        <div class="message-content">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
    `

  chatMessages.appendChild(typingDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight

  return typingDiv
}

function generateFallbackResponse(message) {
  const messageLower = message.toLowerCase()

  if (messageLower.includes("contract") || messageLower.includes("agreement")) {
    return "For contract-related questions, key considerations include: parties involved, clear obligations, payment terms, termination clauses, and dispute resolution. Always have contracts reviewed by a qualified attorney before signing."
  }

  if (messageLower.includes("copyright") || messageLower.includes("trademark")) {
    return "Copyright protection generally covers original works of authorship. Key points: automatic protection upon creation, registration provides additional benefits, fair use exceptions exist, and duration varies by work type. Consult an IP attorney for specific cases."
  }

  if (messageLower.includes("employment") || messageLower.includes("workplace")) {
    return "Employment law covers wages, discrimination, harassment, and workplace safety. Important: document workplace issues, know your rights under federal and state laws, and consider consulting an employment attorney for serious matters."
  }

  if (messageLower.includes("privacy") || messageLower.includes("data")) {
    return "Privacy laws like GDPR and CCPA require proper data handling. Key requirements: obtain consent, implement security measures, provide user rights, and maintain compliance documentation. Consult a privacy attorney for specific compliance needs."
  }

  return "Thank you for your question. For specific legal matters, I recommend consulting with a qualified attorney who can provide personalized advice based on your situation and applicable laws in your jurisdiction."
}

function updateMessageTime() {
  const timeElements = document.querySelectorAll(".message-time")
  const now = new Date()
  if (timeElements.length > 0) {
    timeElements[0].textContent = now.toLocaleTimeString()
  }
}

// Toast notifications
function showToast(title, message, type = "success") {
  const toast = document.createElement("div")
  toast.className = `toast ${type}`

  toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `

  toastContainer.appendChild(toast)

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.remove()
  }, 5000)
}

// Audio player controls
document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("playBtn")
  const audioPlayer = document.getElementById("audioPlayer")

  if (playBtn && audioPlayer) {
    playBtn.addEventListener("click", () => {
      if (isPlaying) {
        audioPlayer.pause()
        playBtn.innerHTML = '<i class="fas fa-play"></i>'
        isPlaying = false
      } else {
        audioPlayer.play()
        playBtn.innerHTML = '<i class="fas fa-pause"></i>'
        isPlaying = true
      }
    })

    audioPlayer.addEventListener("ended", () => {
      playBtn.innerHTML = '<i class="fas fa-play"></i>'
      isPlaying = false
    })
  }
})
