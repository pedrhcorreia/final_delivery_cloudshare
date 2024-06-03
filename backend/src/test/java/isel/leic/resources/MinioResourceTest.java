package isel.leic.resources;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import isel.leic.model.storage.FormData;
import isel.leic.resource.FileSharingResource;
import jakarta.ws.rs.core.MediaType;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;

import static io.restassured.RestAssured.given;
import static io.smallrye.common.constraint.Assert.assertNotNull;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class MinioResourceTest {

    private static String token;
    private static Long userId1;

    private static String token2;
    private static Long userId2;

    private static byte[] fileArr;

    private static String anonymousToken;


    @Test
    @Order(1)
    public void testUploadFile_ValidFormData() {

        String jsonBody = "{\"username\":\"testUser\",\"password\":\"testPassword\"}";
        Response response = given()
                .contentType(ContentType.JSON)
                .body(jsonBody)
                .when()
                .post("/auth/signup");

        token = response.jsonPath().getString("token");
        userId1 = (long) response.jsonPath().getInt("user.id");


        File file = new File("src/main/resources/test-file.txt");
        FormData formData = new FormData();
        formData.data = file;
        formData.filename = "test-file.txt";
        formData.mimetype = "text/plain";

        CompletableFuture<Response> uploadFuture = CompletableFuture.supplyAsync(() ->
                given()
                        .header("Authorization", "Bearer " + token)
                        .multiPart("file", file, MediaType.APPLICATION_OCTET_STREAM)
                        .formParam("filename", formData.filename)
                        .formParam("mimetype", formData.mimetype)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .when()
                        .post("/user/" + userId1 + "/object")
        );

        Response uploadResponse = uploadFuture.join();
        uploadResponse.then().statusCode(201);
    }



    @Test
    @Order(2)
    public void testGenerateAnonymousLink() {
        Response response = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body("{\"expiration\": 3600}") // Expiration time in seconds
                .when()
                .post("/user/" + userId1 + "/object/test-file.txt/anonymous")
                .then()
                .statusCode(200)
                .extract()
                .response();

        anonymousToken = response.jsonPath().getString("token");
    }
    @Test
    @Order(3)
    public void testDownloadFile_ValidObjectId() {

        String objectKey = "test-file.txt";


        CompletableFuture<Response> downloadFuture = CompletableFuture.supplyAsync(() ->
                given()
                        .header("Authorization", "Bearer " + token)
                        .expect()
                        .statusCode(200)
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(notNullValue())
                        .when()
                        .get("/user/" + userId1 + "/object/" + objectKey)
        );



    }


    @Test
    @Order(4)
    public void testGetFileInfoFromAnonymousLink() {

        Response response = given()
                .queryParam("token", anonymousToken)
                .expect()
                .statusCode(200)
                .contentType(MediaType.APPLICATION_JSON)
                .when()
                .get("anonymous/info");


        response.then()
                .assertThat()
                .body("fileName", equalTo("test-file.txt"))
                .body("userId", equalTo(userId1.intValue())) // Assuming userId is an int
                .body("username", notNullValue());
    }

    @Test
    @Order(5)
    public void testDownloadFileFromAnonymousLink() {

        Response response = given()
                .queryParam("token", anonymousToken)
                .expect()
                .statusCode(200)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(notNullValue())
                .when()
                .get("anonymous/download");



        byte[] downloadedFileContent = response.getBody().asByteArray();
        assertNotNull(downloadedFileContent);


        byte[] originalFileContent = null;
        try {
            originalFileContent = Files.readAllBytes(Paths.get("src/main/resources/test-file.txt"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        assertArrayEquals(originalFileContent, downloadedFileContent);
    }

    @Test
    @Order(6)
    public void testRenameFile() {

        String objectKey = "test-file.txt";
        String newName = "new-test-file.txt";


        given()
                .header("Authorization", "Bearer " + token)
                .queryParam("newName", newName)
                .when()
                .put("/user/" + userId1 + "/object/" + objectKey)
                .then()
                .statusCode(200);


        CompletableFuture<Response> downloadFuture = CompletableFuture.supplyAsync(() ->
                given()
                        .header("Authorization", "Bearer " + token)
                        .when()
                        .get("/user/" + userId1 + "/object/" + newName)
        );

        Response response = downloadFuture.join();
        response.then().statusCode(200);



        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/user/" + userId1 + "/object/" + objectKey)
                .then()
                .statusCode(404);
    }

    @Test
    @Order(7)
    public void testShareFileBetweenUsers() {

        String newUserJsonBody = "{\"username\":\"newUser\",\"password\":\"newUserPassword\"}";
        Response response = given()
                .contentType(ContentType.JSON)
                .body(newUserJsonBody)
                .when()
                .post("/auth/signup");

        token2 = response.jsonPath().getString("token");
        userId2 = (long) response.jsonPath().getInt("user.id");





        FileSharingResource.ShareRequest shareRequest = new FileSharingResource.ShareRequest(
                FileSharingResource.ShareRequest.RecipientType.USER,
                userId2,
                "new-test-file.txt"
        );

        given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(shareRequest)
                .when()
                .post("/user/" + userId1 + "/fileshare")
                .then()
                .statusCode(200);


        given()
                .header("Authorization", "Bearer " + token2)
                .when()
                .get("/user/" + userId1 + "/object/new-test-file.txt")
                .then()
                .statusCode(200);  // Assuming the file is successfully accessed
    }

    @Test
    @Order(8)
    public void testDeleteObjectAndUser() {

        String objectKey = "new-test-file.txt";


        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/user/" + userId1 + "/object/" + objectKey)
                .then()
                .statusCode(200);


        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/user/" + userId1 + "/object")
                .then()
                .statusCode(200)
                .body("size()", equalTo(0));


        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/user/" + userId1)
                .then()
                .statusCode(200);

        given()
                .header("Authorization", "Bearer " + token2)
                .when()
                .delete("/user/" + userId2)
                .then()
                .statusCode(200);
    }
}