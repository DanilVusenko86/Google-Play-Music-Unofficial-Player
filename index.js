const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const NodeID3 = require('node-id3');
const mm = require('music-metadata'); 

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a', '.wma'];

const DEFAULT_THUMBNAIL_BASE64 = 'data:image/png;base64,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GxVQVSmSqNv+g1pqXWqzJl3MTJxsw7396AadpZoZ+R5WvdTaq4g80mTEdhMqum0T8egV0txE5O0Fa/vP1pv0YfuBbDfoEevcnXC4paEVEZFtggrLAbqz3Z23egg3CC/H/BkAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CYyHcAiIl8B4CY/g//09kU9MHpyQAAAABJRU5ErkJggg=='; 

async function getTrackMetadata(trackPath) {
    const extension = path.extname(trackPath).toLowerCase();
    const defaultMetadata = {
        raw: {
            TIT2: path.basename(trackPath, extension),
            TALB: 'Unknown Album',
            TPE1: 'Unknown Artist'
        },
        image: null
    };

    try {
        if (extension === '.mp3') {
            return new Promise((resolve) => {
                NodeID3.read(trackPath, (err, tags) => {
                    if (err) {
                        console.error(`Error reading MP3 metadata for ${trackPath}:`, err);
                        return resolve(defaultMetadata);
                    }
                    resolve({
                        raw: {
                            TIT2: tags.title || defaultMetadata.raw.TIT2,
                            TALB: tags.album || defaultMetadata.raw.TALB,
                            TPE1: tags.artist || defaultMetadata.raw.TPE1
                        },
                        image: tags.image && tags.image.imageBuffer ? { imageBuffer: tags.image.imageBuffer } : null
                    });
                });
            });
        } else {
            const metadata = await mm.parseFile(trackPath, { skipCovers: false });
            const common = metadata.common;

            const title = common.title || defaultMetadata.raw.TIT2;
            const album = common.album || defaultMetadata.raw.TALB;
            const artist = common.artists?.join(', ') || common.artist || defaultMetadata.raw.TPE1;
            const picture = common.picture && common.picture[0];

            return {
                raw: {
                    TIT2: title,
                    TALB: album,
                    TPE1: artist
                },
                image: picture ? { imageBuffer: picture.data } : null
            };
        }
    } catch (error) {
        console.error(`Error reading metadata for ${trackPath}:`, error);
        return defaultMetadata;
    }
}

async function scanMusicFolder(folderPath, outputPath) {
    const albums = new Map();

    try {
        const subFolders = fs.readdirSync(folderPath)
            .filter(f => fs.statSync(path.join(folderPath, f)).isDirectory());

        for (const folder of subFolders) {
            const folderPathFull = path.join(folderPath, folder);
            const musicFiles = fs.readdirSync(folderPathFull)
                .filter(f => SUPPORTED_FORMATS.includes(path.extname(f).toLowerCase()));

            if (musicFiles.length === 0) continue;

            for (const track of musicFiles) {
                const trackPath = path.join(folderPathFull, track);
                const trackTags = await getTrackMetadata(trackPath);
                const albumName = trackTags.raw.TALB || 'Unknown Album';
                const trackArtist = trackTags.raw.TPE1 || 'Unknown Artist';

                const trackImage = trackTags.image && trackTags.image.imageBuffer
                    ? `data:image/png;base64,${trackTags.image.imageBuffer.toString('base64')}`
                    : DEFAULT_THUMBNAIL_BASE64;

                const trackData = {
                    title: trackTags.raw.TIT2,
                    artist: trackArtist,
                    path: trackPath,
                    cover: trackImage
                };

                if (!albums.has(albumName)) {
                    albums.set(albumName, {
                        name: albumName,
                        artist: trackArtist, 
                        cover: trackImage, 
                        tracks: []
                    });
                }

               
                const album = albums.get(albumName);
                if (trackArtist !== 'Unknown Artist' && album.artist === 'Unknown Artist') {
                    album.artist = trackArtist;
                }

                if (album.cover === DEFAULT_THUMBNAIL_BASE64 && trackImage !== DEFAULT_THUMBNAIL_BASE64) {
                    album.cover = trackImage;
                }

                album.tracks.push(trackData);
            }
        }

        const albumsArray = Array.from(albums.values());
        fs.writeFileSync(outputPath, JSON.stringify(albumsArray, null, 2));
        console.log(`Albums data written to ${outputPath}`);
    } catch (error) {
        console.error('Error scanning music folder:', error);
        throw error;
    }
}

ipcMain.on('scanMusicFolder', async (event, folderPath) => {
    const outputPath = path.join(__dirname, 'json', 'music.json');
    try {
        await scanMusicFolder(folderPath, outputPath);
        event.reply('scan-complete', { success: true, outputPath });
    } catch (error) {
        event.reply('scan-complete', { success: false, error: error.message });
    }
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        minWidth: 1098,
        minHeight: 628,
        width: 1157,
        height: 686,
        transparent: true,
        frame: false,
        icon: path.join(__dirname, 'img', 'icon.ico'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');
    

    ipcMain.on("save-color", (event, color) => {
        const filePath = path.join(__dirname, "json", "theme.json");
        try {
            let json = {};
            if (fs.existsSync(filePath)) {
                json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
            json.highlight = color;
            fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
            console.log("Color saved successfully:", color);
        } catch (err) {
            console.error("Error saving color:", err);
        }
    });

    ipcMain.handle('dialog:selectFolder', async () => {
        try {
            const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
            return result.canceled ? null : result.filePaths[0];
        } catch (error) {
            console.error('Error selecting folder:', error);
            return null;
        }
    });

    ipcMain.on("minimize", () => {
        mainWindow.minimize()
    });

    ipcMain.on("maximize", () => {
        mainWindow.maximize()
    });

    ipcMain.on("unmaximize", () => {
        mainWindow.unmaximize()
    });

    ipcMain.handle("ismaximized", () => {
        return mainWindow.isMaximized()
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

