# AI Assistant Setup Guide

## Overview

The AI Assistant feature allows users to automatically extract expense information from text and images using Google's Gemini AI. Users can upload images of receipts, credit card statements, or paste text descriptions to automatically generate expense entries.

## Features

- **Text Processing**: Paste credit card statements or describe expenses in natural language
- **Image Processing**: Upload images of receipts, statements, or other expense documents
- **Smart Extraction**: AI automatically identifies categories, amounts, dates, and notes
- **Database Categories**: Uses exact categories from your database, with "Others" for unmatched items
- **Calculation Notes**: AI explains how amounts were calculated from the input
- **Manual Review**: Users can edit extracted information before adding to the ledger
- **Batch Processing**: Add multiple expenses at once

## Setup

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment Variables

Add the following to your `.env.development` or `.env.production` file:

```bash
GOOGLE_API_KEY=your-google-ai-api-key-here
```

### 3. Install Dependencies

The required dependencies are already included in `requirements.txt`:

```bash
pip install google-generativeai==0.3.2
pip install Pillow==10.1.0
```

### 4. Restart the Backend

After adding the API key, restart your backend server:

```bash
cd backend
python main.py
```

## Usage

### For Users

1. **Access the AI Assistant**: Click the "AI Assistant" button in the Accounting page
2. **Provide Input**: 
   - Paste text describing expenses or credit card statements
   - Upload images of receipts or statements
   - Or both
3. **Process**: Click "Process with AI" to extract expenses
4. **Review**: Edit any extracted information as needed
5. **Confirm**: Click "Add Expenses" to add them to your ledger

### For Developers

#### Backend API Endpoints

- `POST /ai-assistant/process-expense`: Process text and images to extract expenses
- `GET /ai-assistant/health`: Check AI assistant configuration status

#### Frontend Components

- `AIAssistant.tsx`: Main AI assistant modal component
- Integrated into `LedgerPage.tsx` with AI assistant button

## API Response Format

The AI assistant returns expenses in this format:

```json
{
  "entries": [
    {
      "category": "Food & Dining",
      "amount": 45.67,
      "year": 2024,
      "month": 3,
      "notes": "Calculated from restaurant bill showing $45.67 for dinner on March 15th"
    }
  ],
  "confidence": 0.85,
  "raw_response": "AI response text"
}
```

### Category Handling

- **Database Categories**: The AI uses only the exact categories available in your database
- **Others Category**: Any expenses that don't match database categories are classified as "Others"
- **Calculation Notes**: The AI explains how each amount was calculated from the input text/images

## Error Handling

- **No API Key**: Shows error if `GOOGLE_API_KEY` is not configured
- **Invalid Input**: Validates that text or images are provided
- **AI Processing Errors**: Displays error messages from the AI service
- **JSON Parsing Errors**: Shows raw AI response for debugging

## Security Considerations

- API keys are stored in environment variables
- Images are processed server-side and not stored permanently
- User authentication is required to access the AI assistant
- File uploads are validated for image types only

## Troubleshooting

### Common Issues

1. **"AI service not configured"**: Check that `GOOGLE_API_KEY` is set in environment
2. **"No expenses found"**: Try providing more detailed text or clearer images
3. **Processing errors**: Check the raw AI response for debugging information

### Debug Mode

To see the raw AI response for debugging:

1. Process an expense that returns no results
2. The raw AI response will be displayed in the results section
3. This helps identify if the AI is returning unexpected formats

## Future Enhancements

- Support for more image formats
- Improved category mapping
- Batch image processing
- Export/import of AI training data
- Custom category training 