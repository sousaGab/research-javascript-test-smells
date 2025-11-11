export class NoFileError extends Error {
  constructor () {
    super('No file found. Please, check the GLOB pattern for this project.')
    this.name = 'NoFileError'
  }
}