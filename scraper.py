import urllib.request
import xml.etree.ElementTree as ET
import json
import re
import time

BASE_URL = 'https://techleads.fyi'
SITEMAP_URL = f'{BASE_URL}/sitemap.xml'

def fetch_xml(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    print(f"Fetching sitemap index from {SITEMAP_URL}...")
    xml_data = fetch_xml(SITEMAP_URL)
    if not xml_data:
        print("Failed to fetch sitemap index.")
        return

    # Parse sitemap index
    root = ET.fromstring(xml_data)
    
    # XML namespaces are usually present in sitemaps
    # Need to handle xmlns: http://www.sitemaps.org/schemas/sitemap/0.9
    namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    sitemap_urls = [loc.text for loc in root.findall('.//ns:loc', namespaces)]
    if not sitemap_urls:
        # Fallback without namespace if it fails
        sitemap_urls = [loc.text for loc in root.findall('.//{*}loc')]

    print(f"Found {len(sitemap_urls)} sitemaps.")

    categories = set()
    technologies = set()

    for sitemap_url in sitemap_urls:
        print(f"Fetching {sitemap_url}...")
        sub_xml = fetch_xml(sitemap_url)
        if not sub_xml:
            continue
            
        sub_root = ET.fromstring(sub_xml)
        urls = [loc.text for loc in sub_root.findall('.//ns:loc', namespaces)]
        if not urls:
            urls = [loc.text for loc in sub_root.findall('.//{*}loc')]
            
        for url in urls:
            if '/category/' in url:
                name = url.split('/category/')[-1].replace('-', ' ').title()
                categories.add((name, url))
            elif '/technology/' in url:
                name = url.split('/technology/')[-1].replace('-', ' ').title()
                technologies.add((name, url))
        
        time.sleep(1) # Polite delay

    # Convert sets to list of dicts
    categories_list = [{'name': name, 'url': url} for name, url in categories]
    technologies_list = [{'name': name, 'url': url} for name, url in technologies]

    print(f"Total categories found: {len(categories_list)}")
    print(f"Total technologies found: {len(technologies_list)}")

    result = {
        'categories': categories_list,
        'technologies': technologies_list
    }

    output_file = 'techleads_full_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
        
    print(f"Data successfully saved to {output_file}")

if __name__ == "__main__":
    main()
