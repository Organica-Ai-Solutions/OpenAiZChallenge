# 🛡️ UI PROTECTION RULES

## CRITICAL: Never change these without explicit user request

### ✅ APPROVED COMPONENTS:
- `animated-ai-chat.tsx` - User's beautiful animated chat (PROTECTED)
- Beautiful glass-morphism UI with gradients (PROTECTED)
- Floating particles and animations (PROTECTED)

### ❌ FORBIDDEN CHANGES:
- Never change activeService from 'animated' in chat page
- Never create new chat components unless explicitly requested
- Never replace working UI components
- Never change beautiful styling without permission

### ✅ ALLOWED ENHANCEMENTS:
- Add intelligence to existing responses
- Enhance backend integration  
- Add action agents and continuous processing
- Make responses longer and more detailed
- Add Cursor-style reasoning

## 🔒 PROTECTION COMMAND:
```bash
# Lock the chat page to animated service
grep -l "useState.*animated" app/chat/page.tsx && echo "✅ Protected"
``` 