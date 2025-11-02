
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
