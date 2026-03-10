```
docker compose -f docker-compose.yml up -d --force-recreate    

docker stop $(docker ps -a -q)   
docker rm $(docker ps -a -q)    
docker rmi -f $(docker images -aq)   
docker system prune -a    
docker volume prune -a     
```
