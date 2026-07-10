FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY BarsHr.Api/BarsHr.Api.csproj BarsHr.Api/
RUN dotnet restore BarsHr.Api/BarsHr.Api.csproj
COPY BarsHr.Api/ BarsHr.Api/
RUN dotnet publish BarsHr.Api/BarsHr.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "BarsHr.Api.dll"]
