// Test Enhanced Chat Service
// Run this in the browser console to test the enhanced AI chat

console.log('🧠 TESTING ENHANCED CHAT SERVICE');

// Test function to verify enhanced chat is working
async function testEnhancedChat() {
  console.log('🔍 Testing enhanced chat capabilities...');
  
  // Check if enhanced chat service is available
  if (typeof window !== 'undefined' && window.location.pathname.includes('/chat')) {
    console.log('✅ On chat page, testing enhanced features...');
    
    // Test messages to verify AI reasoning
    const testMessages = [
      'lets make a discovery in suriname',
      'divine analysis',
      '/analyze 4.5, -55.2',
      'what is the status of the agents?'
    ];
    
    console.log('🎯 Test messages prepared:', testMessages);
    console.log('📝 To test manually:');
    testMessages.forEach((msg, index) => {
      console.log(`${index + 1}. Type: "${msg}"`);
    });
    
    console.log('\n🧠 Enhanced features to look for:');
    console.log('✅ AI Reasoning Process (🧠 dropdown)');
    console.log('✅ Tools Used indicators (🔧)');
    console.log('✅ Saved to DB indicators');
    console.log('✅ Intelligent responses with context');
    console.log('✅ Coordinate analysis with real data');
    
    return true;
  } else {
    console.log('❌ Not on chat page. Navigate to /chat first.');
    return false;
  }
}

// Auto-test function
function autoTestEnhancedChat() {
  console.log('🤖 Running automated enhanced chat test...');
  
  // Try to find the chat input
  const chatInput = document.querySelector('textarea[placeholder*="archaeological"]') || 
                   document.querySelector('textarea') ||
                   document.querySelector('input[type="text"]');
  
  if (chatInput) {
    console.log('✅ Found chat input, testing Suriname discovery...');
    
    // Simulate typing
    chatInput.value = 'lets make a discovery in suriname';
    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Try to find and click send button
    setTimeout(() => {
      const sendButton = document.querySelector('button[type="submit"]') ||
                        document.querySelector('button:contains("Send")') ||
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent.includes('Send') || btn.textContent.includes('→')
                        );
      
      if (sendButton) {
        sendButton.click();
        console.log('🚀 Sent test message! Watch for enhanced AI response...');
      } else {
        console.log('⚠️ Send button not found. Press Enter or click send manually.');
      }
    }, 500);
    
    return true;
  } else {
    console.log('❌ Chat input not found. Make sure you\'re on the chat page.');
    return false;
  }
}

// Run the test
testEnhancedChat();

// Export for manual use
window.testEnhancedChat = testEnhancedChat;
window.autoTestEnhancedChat = autoTestEnhancedChat;

console.log('\n🎯 ENHANCED CHAT TEST READY!');
console.log('📋 Manual test: testEnhancedChat()');
console.log('🤖 Auto test: autoTestEnhancedChat()'); 