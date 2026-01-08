async function testChatbot() {
    try {
        console.log('Testing Chatbot API...');
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Bonjour, quels sont les restaurants italiens ?" })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response received:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Test failed:', error.message);
        console.log('Make sure the server is running on port 5000');
    }
}

testChatbot();
