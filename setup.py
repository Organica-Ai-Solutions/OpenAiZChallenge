from setuptools import setup, find_packages

setup(
    name='indigenous-knowledge-platform',
    version='0.1.0',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'fastapi==0.95.1',
        'uvicorn==0.22.0',
        'sqlalchemy==2.0.15',
        'pydantic==2.6.3',
        'python-jose==3.3.0',
        'passlib==1.7.4',
        'bcrypt==4.0.1',
        'aiosqlite==0.19.0',
        'numpy==1.26.4',
        'python-multipart==0.0.6'
    ],
    extras_require={
        'dev': [
            'pytest==7.3.1',
            'pytest-asyncio==0.21.0',
            'httpx==0.24.0'
        ]
    },
    entry_points={
        'console_scripts': [
            'nis-platform=src.main:main',
        ],
    },
    author='Indigenous Knowledge Research Team',
    description='Distributed platform for indigenous knowledge validation and research',
    long_description=open('README.md').read(),
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.10',
    ],
) 