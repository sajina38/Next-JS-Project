import { useQuery } from '@tanstack/react-query';
import { fetchBlogs } from '../actions/blogActions';
import { Blog } from '../types/blog';

export function useBlogs() { //yo function use garna milcha aru ma
  return useQuery<Blog[]>({
    queryKey: ['blogs'], //key or name rakheko matra
    queryFn: fetchBlogs, //blogActions bata fetch gareko
  });
}