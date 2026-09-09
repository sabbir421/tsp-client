import './globals.css';
import StoreProvider from './store/StoreProvider';

export const metadata = {
  title: 'TrueSpace Property',
  description: 'Find, rent, and manage properties with TrueSpace Property',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
