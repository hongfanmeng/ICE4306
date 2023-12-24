#!/bin/bash
conda create -n ice4306 python=3.11
conda activate ice4306
conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia
pip install -r requirements.txt