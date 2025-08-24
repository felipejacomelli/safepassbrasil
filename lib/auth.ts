import Cookies from 'js-cookie';

export const getAuth = () => {
  return Cookies.get('tokenauth')
}
