// 환경 변수 설정
process.env.AWS_BUCKET_NAME = "test-bucket";
process.env.AWS_ACCESS_KEY_ID = "test-access-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import imageService from "./image.service";
import { s3 } from "../utils/uploadToS3";

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("../utils/uploadToS3");

const mockS3 = s3 as jest.Mocked<typeof s3>;
const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

describe("S3 이미지 업로드 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("이미지 업로드", () => {
    const mockFile = {
      fieldname: "image",
      originalname: "test-image.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      size: 1024,
      stream: {} as any,
      destination: "",
      filename: "test-image.jpg",
      path: "",
      buffer: Buffer.from("test"),
      location: "https://test-bucket.s3.amazonaws.com/test-image.jpg",
      key: "test-image.jpg",
      bucket: "test-bucket",
    } as any;

    test("공개 이미지는 presigned URL 없이 업로드되어야 한다", async () => {
      const result = await imageService.uploadImage(mockFile, false);

      expect(result).toEqual({
        url: mockFile.location,
        key: mockFile.key,
        originalname: mockFile.originalname,
        presignedUrl: null,
      });

      expect(mockGetSignedUrl).not.toHaveBeenCalled();
    });

    test("비공개 이미지는 presigned URL과 함께 업로드되어야 한다", async () => {
      const mockPresignedUrl = "https://presigned-url.com/test-image.jpg";
      mockGetSignedUrl.mockResolvedValue(mockPresignedUrl);

      const result = await imageService.uploadImage(mockFile, true);

      expect(result).toEqual({
        url: mockFile.location,
        key: mockFile.key,
        originalname: mockFile.originalname,
        presignedUrl: mockPresignedUrl,
      });

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: mockFile.key,
      });
      expect(mockGetSignedUrl).toHaveBeenCalledWith(mockS3, expect.any(GetObjectCommand), {
        expiresIn: 300,
      });
    });

    test("presigned URL 생성 오류를 적절히 처리해야 한다", async () => {
      mockGetSignedUrl.mockRejectedValue(new Error("S3 error"));

      await expect(imageService.uploadImage(mockFile, true)).rejects.toThrow("S3 error");

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: mockFile.key,
      });
      expect(mockGetSignedUrl).toHaveBeenCalledWith(mockS3, expect.any(GetObjectCommand), {
        expiresIn: 300,
      });
    });

    test("환경 변수에서 올바른 AWS 버킷 이름을 사용해야 한다", async () => {
      process.env.AWS_BUCKET_NAME = "custom-bucket";
      mockGetSignedUrl.mockResolvedValue("https://presigned-url.com/test-image.jpg");

      await imageService.uploadImage(mockFile, true);

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: "custom-bucket",
        Key: mockFile.key,
      });
    });

    test("올바른 파일 메타데이터를 반환해야 한다", async () => {
      const customFile = {
        ...mockFile,
        originalname: "custom-name.png",
        key: "custom-key.png",
        location: "https://custom-location.com/custom-key.png",
      } as any;

      const result = await imageService.uploadImage(customFile, false);

      expect(result.originalname).toBe("custom-name.png");
      expect(result.key).toBe("custom-key.png");
      expect(result.url).toBe("https://custom-location.com/custom-key.png");
    });
  });
});
