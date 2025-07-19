# AI Service Troubleshooting Guide

## Issue: Suggestions showing fallback reasoning instead of AI-generated reasoning

If you're seeing suggestions with reasoning like "Basic suggestion for Adventure - this tag might fit your story based on general compatibility" instead of proper AI-generated reasoning, follow these steps:

### 1. Check AI Service Setup

Run the AI setup check:
```bash
cd backend-api
node check-ai-setup.js
```

This will verify:
- OPENAI_API_KEY environment variable is set
- AI service can connect to OpenAI API
- Basic API calls work
- Iterative suggestion generation works

### 2. Common Issues and Solutions

#### Issue: OPENAI_API_KEY not set
**Error**: `OPENAI_API_KEY environment variable is missing or empty`

**Solution**: Set the environment variable:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

#### Issue: Invalid API key
**Error**: `Incorrect API key provided`

**Solution**: 
1. Check your OpenAI API key at https://platform.openai.com/api-keys
2. Ensure the key is valid and has sufficient credits
3. Update the environment variable with the correct key

#### Issue: Rate limiting
**Error**: `Rate limit exceeded`

**Solution**:
1. Check your OpenAI usage at https://platform.openai.com/usage
2. Wait for rate limit to reset or upgrade your plan
3. Reduce the number of suggestions requested

#### Issue: API service unavailable
**Error**: `OpenAI service is not available`

**Solution**:
1. Check OpenAI status at https://status.openai.com/
2. Wait for service to be restored
3. Check your internet connection

### 3. Debugging Steps

If the issue persists, enable detailed logging:

1. Check the server logs for AI service errors
2. Look for messages like:
   - "AI service connection test failed"
   - "AI returned fallback reasoning instead of proper AI reasoning"
   - "JSON parsing error"

3. The system will now throw errors instead of falling back to simple suggestions, making it easier to identify the root cause.

### 4. Testing the Fix

After fixing the issue:

1. Restart your backend server
2. Try generating suggestions again
3. You should now see proper AI-generated reasoning instead of fallback text

### 5. Expected Behavior

When working correctly, you should see:
- Suggestions with detailed, creative reasoning
- Reasoning that references the story context
- Specific suggestions about how the tag could enhance the story
- No mentions of "Basic suggestion" or "general compatibility"

### 6. Contact Support

If you continue to have issues:
1. Run the setup check and share the output
2. Check the server logs for error messages
3. Verify your OpenAI API key and account status 