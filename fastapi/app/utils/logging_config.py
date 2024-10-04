import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Configurar loggers específicos si es necesario
    # Por ejemplo:
    # requests_logger = logging.getLogger('requests')
    # requests_logger.setLevel(logging.WARNING)

setup_logging()