const getNSFW = async (tags) => {
  try {
    const response = await fetch(
      `https://api.waifu.im/search?included_tags=${tags}&many=true`
    );
    const data = await response.json();
    const imageUrls = await Promise.all(
      data.images.map((image) => getPNGContentFromURL(image.url))
    );
    return imageUrls;
  } catch (error) {
    console.error("Error fetching nsfw details:", error);
    return null;
  }
};


const getNSFWTags = async () => {
  try {
    const response = await fetch(`https://api.waifu.im/tags`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching nfwtags details:", error);
    return null;
  }
};

module.exports = {
  getNSFW,
  getNSFWTags,
};