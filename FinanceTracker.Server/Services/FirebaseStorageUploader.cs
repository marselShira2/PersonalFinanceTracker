using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using System.IO;

public class FirebaseStorageUploader
{
    private readonly StorageClient _storage;
    private readonly string _bucketName = "ise-photo-bucket";

    public FirebaseStorageUploader()
    {
        Console.WriteLine("Initializing FirebaseStorageUploader...");
        var serviceAccountJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "isefinancetracker.json");
        var credential = GoogleCredential.FromFile(serviceAccountJsonPath);
        _storage = StorageClient.Create(credential);

    }

    public async Task<string> UploadAsync(IFormFile file, string objectName, CancellationToken ct = default)
    {
        await using var stream = file.OpenReadStream();

        try
        {
             var obj = await _storage.UploadObjectAsync(
            bucket: _bucketName,
            objectName: objectName,
            contentType: file.ContentType ?? "application/octet-stream",
            source: stream,
            cancellationToken: ct
        );
                       // Returns the public GCS URL
        return $"https://storage.googleapis.com/{_bucketName}/{obj.Name}";

        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error uploading file: {ex.Message}");
            throw;          
        }
               
    }
}