package isel.leic.services;

import io.quarkus.test.junit.QuarkusTest;
import isel.leic.model.storage.FileObject;
import isel.leic.model.storage.FormData;
import isel.leic.service.MinioService;
import jakarta.inject.Inject;
import org.junit.jupiter.api.*;
import software.amazon.awssdk.services.s3.model.Bucket;

import java.io.File;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class MinioServiceTest {

    @Inject
    MinioService minioService;

    @Test
    @Order(1)
    public void testCreateBucket() throws InterruptedException, ExecutionException {
        String bucketName = "test-bucket";
        String result = minioService.createBucket(bucketName).join();
        assertTrue(result.startsWith("Bucket created successfully"), "Bucket creation failed");
    }

    @Test
    @Order(2)
    public void testListBuckets() throws InterruptedException, ExecutionException {
        List<Bucket> buckets = minioService.listBuckets().join();
        assertTrue(buckets.size() > 0, "No buckets found");
    }

    @Test
    @Order(3)
    public void testUploadObject() {

        FormData formData = new FormData();
        formData.data = new File("src/main/resources/test-file.txt");
        formData.filename = "/home/test-file.txt";
        formData.mimetype = "text/plain";

        CompletableFuture<String> test = minioService.createEmptyFolder("test-bucket","home/test");

        CompletableFuture<String> uploadFuture = minioService.uploadObject("test-bucket", formData);
        String result = uploadFuture.join();
        assertTrue(result.startsWith("Object uploaded successfully"), "Object upload failed");
    }

    @Test
    @Order(4)
    public void testListObjectsAndDeleteObject() throws InterruptedException, ExecutionException {

        List<FileObject> response = minioService.listObjects("test-bucket", "home").join();


        String objectKey = null;
        for (FileObject fileObject : response) {
            if (fileObject.getObjectKey().equals("home/test-file.txt")) {
                objectKey = fileObject.getObjectKey();
                break;
            }
        }


        assertNotNull(objectKey, "Object key not found");


        String deleteResult = minioService.deleteObject("test-bucket", objectKey).join();


        assertTrue(deleteResult.startsWith("Object deleted successfully"), "Object deletion failed");
        minioService.deleteBucket("test-bucket");
    }
}
