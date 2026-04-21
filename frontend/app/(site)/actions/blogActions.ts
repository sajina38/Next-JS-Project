
'use server';

import { Blog } from "../types/blog";

export async function fetchBlogs(): Promise<Blog[]> { // promise -> jun jun types declare garecha tei dekhauni bhaneko 
const res = await fetch('https://your-api.com/blogs', { 
    cache: 'no-store',  //latest data nai dekha bhaneko 
});
if (!res.ok) { // response garena bhaney error dekhauni 
    throw new Error('Failed to fetch blogs');
  }
 return res.json();
}
