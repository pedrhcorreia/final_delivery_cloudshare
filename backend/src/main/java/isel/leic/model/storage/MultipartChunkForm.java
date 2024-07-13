package isel.leic.model.storage;

import java.io.File;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.RestForm;

public class MultipartChunkForm {

    @RestForm("file")
    @Schema(type = SchemaType.STRING, format = "binary")
    public File data;

    @RestForm
    @PartType(MediaType.TEXT_PLAIN)
    public String filename;

    @RestForm
    @PartType(MediaType.TEXT_PLAIN)
    public String uploadId;

    @RestForm
    @PartType(MediaType.TEXT_PLAIN)
    public Integer partNumber;


    public File getData() {
        return data;
    }

    public String getFilename() {
        return filename;
    }

    public String getUploadId() {
        return uploadId;
    }

    public Integer getPartNumber() {
        return partNumber;
    }
}
