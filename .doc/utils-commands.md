```
docker compose -f docker-compose.yml up -d --force-recreate     

// adicionar comando no arquivo ~/.bashrc com alias 'docker-reset'
docker stop $(docker ps -a -q) 2>/dev/null; docker rm $(docker ps -a -q) 2>/dev/null; docker rmi -f $(docker images -aq) 2>/dev/null; docker system prune -a -f; docker volume prune -a -f

docker stop auth_api 2>/dev/null; docker rm auth_api 2>/dev/null; docker rmi -f dotnet/aspnet:8.0 2>/dev/null    
docker compose -f docker-compose.yml up -d --force-recreate auth_api     
docker compose -f docker-compose.yml up -d --force-recreate api     

docker stop belezapro-monorepo-api-1 2>/dev/null; docker images 2>/dev/null;   

docker stop belezapro-monorepo-api-1   
docker rmi xxxxxx --force

docker build -t web -f Dockerfile .    
docker run -p 4200:80 web   

docker compose -f docker-compose.yml up api    
docker compose -f docker-compose.yml down api   

docker rmi -f belezapro-api   
docker build -t api -f Dockerfile .    
docker run -p 8080:8080 api   

```

```
docker login 
docker logout      
```

```
docker build -t auth-api-image -f Dockerfile .     
docker run -p 5300:8080 auth-api-image  
```  

```
docker pull diegoferreirax/auth-api:xx     
docker run -p 5000:8080 diegoferreirax/auth-api:xx 
```  

```
dotnet ef migrations add InitialCreate -- Dev            
dotnet ef database update     
```

```
docker tag abc95440395b diegoferreirax/belezapro-api:1    
docker push diegoferreirax/belezapro-api:1    
```