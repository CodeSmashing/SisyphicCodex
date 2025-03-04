# A Collection of Interactive Web Projects

This repository showcases a variety of personal projects I've developed in my spare time, focusing on interactive browser-based games and creative coding experiments. Whether you're here to explore, learn, or contribute, this collection offers a glimpse into my coding journey and passion for web-based interactivity.


## Getting Started

1. Clone the repository: git clone https://github.com/CodeSmashing/SisyphicCodex
2. Open the desired HTML file in a web browser.
3. For database-dependent features, follow the Database Setup instructions below.


## Dependencies / Prerequisites

Most projects in this repository can run directly in the browser without external dependencies. However, some features require a MySQL database setup for data persistence.


## Projects
### Single-script(ish) games
#### cube.js

A game script that animates multiple cubes (yes, they're actually rectangles) moving around the webpage. 
- Populates the page with article elements representing the cubes
- Pre-existing article elements can be clicked to pause the game


#### pattern.js

A script for generating randomized line patterns on a canvas.
- Highly customizable with a menu at the top of the webpage
- No end goal, just potentially pretty drawings


#### snake.js

A classic Snake game implementation using canvas.
- There is a high-score that's kept track of, but resets when the page is reloaded


#### loop.js

Inspired by the loop traps from the flash game series Submachine by Mateusz Skutnik.
- Allows player movement in a looping environment
- Player wraps around to the opposite side when reaching the edge
- Press the spacebar to toggle a "flashlight"


## Database Setup

This project requires a MySQL database. Follow these steps to set it up:

1.  Ensure you have MySQL installed and running.
2.  Create a database with a name of your choosing [database_name].
    This can be done in the terminal if MySQL is running:
    CREATE DATABASE [database_name];
3.  Afterwards, import the database schema from `/db/schema.sql`:
    mysql -u [username] -p[password] -h [host] [database_name] < `/path/to/db/schema.sql`


## Future Improvements

- Implement persistent storage for user-generated data using MySQL
- Extend menu customization to all scripts
- Add robust input validation and error handling
- Ensure cross-browser compatibility
- Refactor code to use modern JavaScript modules


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas API
- MySQL (for data persistence)


## Attribution

Sound used in the loop.js script:
- **Walking - Snow** by Bricklover  
  [Freesound Link](https://freesound.org/s/560956/)  
  License: Creative Commons 0


## License

This project is licensed under the MIT License. See the `/LICENSE` file for details.


## Last Updated

This README was last updated on March 4, 2025.
