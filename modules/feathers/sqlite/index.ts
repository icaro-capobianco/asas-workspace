import SQLite from 'better-sqlite3'

export default () => {
    return new SQLite( 'main.db' )
}