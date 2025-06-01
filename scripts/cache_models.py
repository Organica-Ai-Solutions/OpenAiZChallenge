import transformers
import torch
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def cache_model(pipeline_type, model_name):
    try:
        logger.info(f'Starting download and caching for model: {model_name} ({pipeline_type})')
        transformers.pipeline(pipeline_type, model=model_name)
        logger.info(f'Successfully downloaded and cached model: {model_name}')
    except Exception as e:
        logger.error(f'Error caching model {model_name}: {e}')
        # Depending on the desired behavior, you might want to raise the exception
        # to fail the Docker build if a model cannot be cached.
        # raise

if __name__ == "__main__":
    logger.info("Starting Hugging Face model pre-caching process...")
    
    models_to_cache = [
        ("feature-extraction", "microsoft/resnet-50"),
        ("text-classification", "bert-base-multilingual-uncased")
        # Add other models here if needed in the future
    ]
    
    for p_type, m_name in models_to_cache:
        cache_model(p_type, m_name)
    
    logger.info("Hugging Face model pre-caching process complete.") 