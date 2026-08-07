-- youtube_url이 구채널(@thelit)로 저장된 경우 공식 채널(@TheLIT_official)로 교체
UPDATE settings
SET value = 'https://youtube.com/@TheLIT_official'
WHERE key = 'youtube_url'
  AND value IN ('', 'https://youtube.com/@thelit', 'http://youtube.com/@thelit',
                'youtube.com/@thelit');
