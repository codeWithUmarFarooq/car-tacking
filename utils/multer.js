import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Utility to sanitize filename
const sanitizeFilename = (name) => {
    return name.replace(/[^\w.]/g, "_");
};
const multerData = (folder) => {
    const uploadPath = `public/${folder}`;

    // Configure storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = file.mimetype.split("/")[1];
            const baseName = sanitizeFilename(path.parse(file.originalname).name);
            cb(null, `${Date.now()}_${baseName}.${ext}`);
        },
    });

    // File filter to accept only image files
    const fileFilter = (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const err = new Error("Invalid file type");
            err.invalidFile = file;
            cb(err);
        }
    };

    const upload = multer({ storage, fileFilter });

    // Middleware to resize if needed
    const resizeIfNeeded = (req, res, next) => {
        const files = [];

        if (req.file) files.push(req.file);
        if (Array.isArray(req.files)) files.push(...req.files);
        if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
            Object.values(req.files).forEach((group) => {
                if (Array.isArray(group)) files.push(...group);
            });
        }

        if (!files.length) return next();

        Promise.all(
            files.map(async (file) => {
                const ext = path.extname(file.filename).toLowerCase();
                if ([".jpg", ".jpeg", ".png"].includes(ext)) {
                    const image = sharp(file.path);
                    const metadata = await image.metadata();
                    if ((metadata.width || 0) > 1920 || (metadata.height || 0) > 1080) {
                        const tempPath = file.path.replace(/(\.\w+)$/, "_resized$1");
                        await image
                            .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
                            .toFile(tempPath);

                        if (fs.existsSync(tempPath)) {
                            fs.renameSync(tempPath, file.path);
                        }
                    }
                }
            })
        )
            .then(() => next())
            .catch((err) => {
                files.forEach((file) => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });

                if (err.invalidFile) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid image format: ${err.invalidFile.originalname}. Only jpg, jpeg, png allowed.`,
                    });
                }

                next(err);
            });
    };

    // Return ready-to-use middlewares
    return {
        array: (field, maxCount) => [upload.array(field, maxCount), resizeIfNeeded],
        single: (field) => [upload.single(field), resizeIfNeeded],
        fields: (fields) => [upload.fields(fields), resizeIfNeeded],
        none: () => upload.none(),
    };
};


export default multerData;