import fs from 'fs/promises'
import { config } from './config'

const initializing = () => {
	fs.opendir(config.dataset.folderDatasets)
		.catch(() => {
			fs.mkdir(config.dataset.folderDatasets, {
				recursive: true,
			})
		})
}

export default initializing