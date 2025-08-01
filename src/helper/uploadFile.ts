import cloudinary from '../configs/cloudinary';

const uploadImage = async (buffer: Buffer) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.log(error);
          return reject(null);
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

export default uploadImage;
