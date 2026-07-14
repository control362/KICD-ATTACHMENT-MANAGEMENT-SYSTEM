import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.util.Map;

public class TestCloudinary {
    public static void main(String[] args) {
        try {
            Cloudinary cloudinary = new Cloudinary("cloudinary://431361654548132:qPhQKtXE1mMGnTrKfVyQiGbQs30@wbebi3oc");
            Map result = cloudinary.uploader().upload("Hello World".getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto"
            ));
            System.out.println("Success! URL: " + result.get("secure_url"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
