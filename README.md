# ✨ Productivity Reminder - Todo App

A modern, feature-rich task management application with a beautiful UI and robust backend.


## 🌟 Features

### Authentication & User Management
- 🔐 Secure user authentication
- 👤 Personal user profiles
- 📱 Mobile number verification
- 🔑 Password encryption


### Task Management
- ✅ Create, edit, and delete tasks
- 📅 Due date tracking
- ⭐ Mark tasks as important
- 🏷️ Categorize tasks
- 🔍 Search functionality
- 📊 Progress tracking

### User Interface
- 🌓 Dark/Light mode toggle
- 📱 Responsive design
- 🎯 Clean and intuitive interface
- ⚡ Real-time updates


## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Modern web browser

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/productivity-reminder.git
cd productivity-reminder
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
mysql -u root -p < setup-database.sql
```

4. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Start the application
```bash
npm start
```

## 💻 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **UI Framework**: Custom CSS with Flexbox/Grid

## 📱 Screenshots

### Sign up Interface
![Sign up](https://github.com/XNethaji/To-do-list/blob/main/Screenshot%202025-03-13%20042159.png)






### Light Mode Interface
![Light Mode](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-13%20042610-T0g9PgbwQJtnvFjBXz8iGnB25sdcrg.png)

### Task Creation
![Add Task](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-13%20042537-7M3asZcGrLWrmwoa1y6p8JW1EOLzd4.png)

## 🔒 Security Features

- Password hashing using bcrypt
- JWT for secure authentication
- Protected API endpoints
- Input validation and sanitization
- CORS protection

## 📊 Database Schema

The application uses a MySQL database with the following main tables:

- `users`: Store user information and credentials
- `tasks`: Store task data with user relationships

![Database Structure](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-13%20042828-ay0irBdMeOPMR0MBgyvXpG7ycLBY9d.png)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide Icons](https://lucide.dev)
- Color palette inspiration from [Tailwind CSS](https://tailwindcss.com)
- UI/UX best practices from [Material Design](https://material.io)

---

Made with  by [NETHAJI K]
