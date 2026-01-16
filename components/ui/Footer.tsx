export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            В© {new Date().getFullYear()} РћРЅР»Р°Р№РЅ-РїР»Р°С‚С„РѕСЂРјР° РїСЂРѕР±РЅРѕРіРѕ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ РїРѕ СЂСѓСЃСЃРєРѕРјСѓ СЏР·С‹РєСѓ
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Р”Р»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р Р’Рџ, Р’РќР– Рё РіСЂР°Р¶РґР°РЅСЃС‚РІР° Р Р¤
          </p>
        </div>
      </div>
    </footer>
  );
}
