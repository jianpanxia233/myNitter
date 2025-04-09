#!/bin/bash

# 启动 Redis 服务器
redis-server --daemonize yes
echo "Redis server started."

# 启动 Nitter
./nitter &
echo "Nitter started."

# # 启动 Climber
# node climber/src/index.js &
# echo "Climber started."

# # 会在后台运行，为了确保每个命令都成功执行，可以打印日志
# wait
# echo "All processes started successfully."
