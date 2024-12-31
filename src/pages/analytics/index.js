// src/pages/analytics/index.js

import React from 'react';
import Link from 'next/link';
import { Layout } from '../../shared/components/Layout';

export default function Analytics() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Аналітика</h1>
        <p className="text-center mb-6">
          Тут ви можете переглянути аналітичні дані вашого бюджету.
        </p>

        {/* Кнопка переходу до Реєстру Договорів */}
        <div className="flex justify-center">
          <Link href="/contracts" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow transition-colors">
            Перейти до Реєстру Договорів
          </Link>
        </div>
      </div>
    </Layout>
  );
}
