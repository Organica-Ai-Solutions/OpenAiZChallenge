# GPT Integration for NIS Protocol

This branch adds integration with the latest OpenAI GPT models to power the NIS (Neuro-Inspired System) Protocol for archaeological site discovery in the Amazon rainforest.

## Features Added

1. **GPTIntegration Class**: A centralized integration layer for interacting with OpenAI's models
   - Located in `src/meta/gpt_integration.py`
   - Provides a unified API for text and vision capabilities

2. **Updated Reasoning Agent**:
   - Now uses GPT-4 Turbo for contextual analysis
   - Integrates historical sources and indigenous knowledge
   - Provides confidence scores and recommended next steps

3. **Enhanced Vision Agent**:
   - Uses GPT-4 Vision for satellite and LIDAR image analysis
   - Extracts pattern types from natural language descriptions
   - Gracefully falls back to mock implementations when GPT is unavailable

## Setup Instructions

1. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the API server:
   ```
   python run_api.py
   ```

## Configuration Options

The GPT integration can be configured by modifying the model parameters:

- `gpt_model` parameter in agent initialization:
  - Vision Agent: Default is "gpt-4-vision-preview"
  - Reasoning Agent: Default is "gpt-4-turbo"

- Temperature settings:
  - Lower values (0.0-0.3) for more deterministic responses
  - Higher values (0.7-1.0) for more creative responses
  - Default is 0.2 for balanced output

## Notes

- The integration requires a valid OpenAI API key with access to GPT-4 series models
- For Plus tier users, update the model names to use the latest available models
- Token costs should be monitored for production deployments

## Future Improvements

- Add streaming capabilities for large responses
- Implement parallel processing of multiple images
- Add support for local embeddings and vector storage
- Create a model fallback chain for rate limit handling

## Contributors

- Feature developed by: Diego Fuego 