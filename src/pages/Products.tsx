import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import ProductGrid from '@/components/ProductGrid';

const ProductsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('nav.products')} - DTA Studio</title>
        <meta name="description" content="Khám phá bộ sưu tập phần mềm và công cụ tự động hóa từ DTA Studio." />
      </Helmet>

      <main className="min-h-screen pt-24 pb-12">
        <ProductGrid />
      </main>
    </>
  );
};

export default ProductsPage;
