
const imagePath = import.meta.env.VITE_THUMBNAILS_PATH
const generic = `${imagePath}/generic.jpg`


export const genericImageUrl = imagePath + '/generic.jpg'
export const getMapImageUrl = (name: string) => imagePath + '/' + name + '.jpg'
export const sharewareMaps = ['start', 'e1m1', 'e1m2', 'e1m3', 'e1m4', 'e1m5', 'e1m6', 'e1m7', 'e1m8']