export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Онлайн-платформа пробного тестирования по русскому языку
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Для получения РВП, ВНЖ и гражданства РФ
          </p>
        </div>
      </div>
    </footer>
  );
}
