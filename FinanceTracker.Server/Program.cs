using FinanceTracker.Server;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using FinanceTracker.Server.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens; 
using System.Text;


//using FinanceTracker.Server.Repositories;
//using FinanceTracker.Server.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<FinanceTracker.Server.Services.IPasswordHasher, FinanceTracker.Server.Services.PasswordHasher>();

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtKey = builder.Configuration["Jwt:Key"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
        };
    });
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Serve static files from wwwroot (for production Angular build)
app.UseDefaultFiles();
app.UseStaticFiles();

// Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Proxy all non-API requests to Angular dev server
    app.Use(async (context, next) =>
    {
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.Redirect("http://localhost:4200" + context.Request.Path);
            return;
        }
        await next();
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Map API controllers
app.MapControllers();

// Fallback to index.html for client-side routing in production
app.MapFallbackToFile("index.html");

app.Run();
