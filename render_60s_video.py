import os
import math
import time
import textwrap
import wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import av

def main():
    start_time = time.time()
    w, h = 1280, 720
    fps = 30
    total_duration = 60.0
    total_frames = int(total_duration * fps) # 1800 frames
    
    art_dir = 'C:/Users/Admin/.gemini/antigravity/brain/c2200641-0416-4e51-aaef-fe78e5eeb4c8'
    output_mp4 = 'D:/pips-dream-studio/giggles_60s_demo.mp4'
    public_mp4 = 'D:/pips-dream-studio/public/giggles_60s_demo.mp4'
    soundtrack_wav = 'D:/pips-dream-studio/final_soundtrack_60s.wav'
    
    # 1. Load scene assets
    scenes_data = [
        {
            "id": 1,
            "title": "1. RETRO CANDYLAND OS",
            "img_path": f"{art_dir}/verify_desktop_homescreen.png",
            "caption": "Welcome to Giggles, The Baby Who Makes the Internet Smile! Built for the haX-baby hackathon, this retro pastel desktop brings pure childlike joy."
        },
        {
            "id": 2,
            "title": "2. CANDYLAND CREATOR STUDIO",
            "img_path": f"{art_dir}/screenshot_candyland_cloudnine.png",
            "caption": "In Candyland Creator, compose dream artwork with custom baby stickers, sparkling candy brushes, colorful stamps, and one-click export."
        },
        {
            "id": 3,
            "title": "3. GIGGLES' DREAM LIBRARY",
            "img_path": f"{art_dir}/verify_dream_library.png",
            "caption": "Relax in Giggles' Dream Library, featuring whimsical storybooks, soothing lullabies, and an ambient sleep soundboard for sweet dreams."
        },
        {
            "id": 4,
            "title": "4. RAINBOW LAUNCH ARCADE",
            "img_path": f"{art_dir}/screenshot_rainbow_launch.png",
            "caption": "Launch Giggles into candy clouds in Rainbow Launch! An arcade mini-game with bouncy trampolines, star combos, and confetti celebrations."
        },
        {
            "id": 5,
            "title": "5. BABY-ME MAGIC (GEMINI AI)",
            "img_path": f"{art_dir}/verify_gemini_success_result.png",
            "caption": "Experience Baby-Me Magic powered by Google Gemini AI! Upload any portrait to generate an adorable baby version with rosy cheeks and sparkling eyes."
        },
        {
            "id": 6,
            "title": "6. BABY GUESTBOOK & LIVE SITE",
            "img_path": f"{art_dir}/verify_baby_guestbook.png",
            "caption": "Leave your wish on the interactive Baby Guestbook! Fully mobile responsive and deployed live right now on Vercel at giggles-candyland-creator.vercel.app!"
        }
    ]
    
    # Pre-process base background images to 1280x720 aspect ratio
    aspect = w / h
    scene_base_images = []
    for s in scenes_data:
        raw_img = Image.open(s["img_path"]).convert('RGB')
        bw, bh = raw_img.size
        if bw / bh > aspect:
            nw = int(bh * aspect)
            left = (bw - nw) // 2
            cropped = raw_img.crop((left, 0, left + nw, bh))
        else:
            nh = int(bw / aspect)
            top = (bh - nh) // 2
            cropped = raw_img.crop((0, top, bw, top + nh))
        # Keep base at 1.08x size so Ken Burns zoom doesn't lose resolution
        base = cropped.resize((int(w * 1.08), int(h * 1.08)), Image.Resampling.LANCZOS)
        scene_base_images.append(base)
        print(f"Pre-processed scene {s['id']}: {s['title']}")

    # 2. Prepare Avatar Badge
    avatar_src = Image.open('D:/pips-dream-studio/public/images/giggles_avatar.png').convert('RGB')
    avatar_size = (112, 112)
    avatar_src = avatar_src.resize(avatar_size, Image.Resampling.LANCZOS)
    
    mask = Image.new('L', avatar_size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, avatar_size[0], avatar_size[1]), fill=255)
    
    circ_avatar = Image.new('RGBA', avatar_size, (0, 0, 0, 0))
    circ_avatar.paste(avatar_src, (0, 0), mask=mask)
    
    avatar_badge = Image.new('RGBA', (avatar_size[0] + 12, avatar_size[1] + 12), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(avatar_badge)
    badge_draw.ellipse((0, 0, avatar_size[0] + 11, avatar_size[1] + 11), fill=(255, 105, 180, 160))
    badge_draw.ellipse((3, 3, avatar_size[0] + 8, avatar_size[1] + 8), fill=(255, 255, 255, 250))
    avatar_badge.paste(circ_avatar, (6, 6), mask=circ_avatar)
    
    # 3. Setup fonts
    font_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 20)
    font_time = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 19)
    font_caption = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 18)
    
    # 4. Setup Rainbow gradient for progress bar
    rainbow_colors = []
    for x in range(w):
        # 6 full cycles or soft rainbow gradient across 1280px
        hue = x / w
        r = int(255 * (0.6 + 0.4 * math.sin(hue * 2 * math.pi)))
        g = int(255 * (0.6 + 0.4 * math.sin(hue * 2 * math.pi + 2.094)))
        b = int(255 * (0.6 + 0.4 * math.sin(hue * 2 * math.pi + 4.188)))
        rainbow_colors.append((r, g, b))

    # 5. Initialize PyAV container
    container = av.open(output_mp4, mode='w')
    
    vstream = container.add_stream('libx264', rate=fps)
    vstream.width = w
    vstream.height = h
    vstream.pix_fmt = 'yuv420p'
    vstream.options = {'crf': '20', 'preset': 'veryfast'}
    
    # Load audio track
    with wave.open(soundtrack_wav, 'rb') as wav_f:
        sample_rate = wav_f.getframerate()
        channels = wav_f.getnchannels()
        raw_audio = wav_f.readframes(wav_f.getnframes())
        audio_int16 = np.frombuffer(raw_audio, dtype=np.int16).astype(np.float32) / 32767.0
        audio_stereo = np.ascontiguousarray(audio_int16.reshape(-1, channels).T)
        
    astream = container.add_stream('aac', rate=sample_rate)
    astream.layout = 'stereo'
    
    print(f"Starting video rendering: {total_frames} frames ({total_duration}s) @ {fps} fps...")
    
    # Helper to get Ken Burns cropped frame
    def get_ken_burns_frame(scene_idx, t_scene, dur_scene=10.0):
        base_img = scene_base_images[scene_idx]
        bw, bh = base_img.size
        # Zoom from 1.00 to 1.045
        scale = 1.00 + 0.045 * (t_scene / dur_scene)
        crop_w = int(w * 1.08 / scale)
        crop_h = int(h * 1.08 / scale)
        crop_x = (bw - crop_w) // 2
        crop_y = (bh - crop_h) // 2
        cropped = base_img.crop((crop_x, crop_y, crop_x + crop_w, crop_y + crop_h))
        return cropped.resize((w, h), Image.Resampling.BILINEAR)

    # 6. Render Frames
    frames_per_scene = int(10.0 * fps) # 300 frames per scene
    crossfade_frames = 10 # 0.33s crossfade between scenes
    
    for frame_idx in range(total_frames):
        t = frame_idx / fps
        scene_idx = min(int(t // 10.0), 5)
        t_scene = t - (scene_idx * 10.0)
        scene = scenes_data[scene_idx]
        
        # Base frame for current scene
        curr_frame = get_ken_burns_frame(scene_idx, t_scene)
        
        # Check crossfade to next scene
        frame_in_scene = frame_idx % frames_per_scene
        if frame_in_scene >= (frames_per_scene - crossfade_frames) and scene_idx < 5:
            alpha = (frame_in_scene - (frames_per_scene - crossfade_frames) + 1) / (crossfade_frames + 1)
            next_frame = get_ken_burns_frame(scene_idx + 1, 0.0)
            # Blend curr and next
            curr_frame = Image.blend(curr_frame, next_frame, alpha)
            
        # End fade out in last 20 frames (frames 1780 to 1800)
        if frame_idx >= (total_frames - 20):
            fade_alpha = (total_frames - frame_idx) / 20.0
            black = Image.new('RGB', (w, h), (10, 6, 20))
            curr_frame = Image.blend(black, curr_frame, fade_alpha)

        # Draw overlays
        overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Progress bar
        prog_px = max(1, min(w, int(w * (t / total_duration))))
        draw.rectangle([0, 0, prog_px, 6], fill=(255, 80, 160, 255))
        draw.rectangle([prog_px, 0, w, 6], fill=(255, 255, 255, 70))
        
        # Top Scene Badge Pill
        badge_text = scene["title"]
        bbox = draw.textbbox((0, 0), badge_text, font=font_title)
        tw = bbox[2] - bbox[0]
        badge_w = tw + 38
        draw.rounded_rectangle([32, 16, 32 + badge_w, 62], radius=14, fill=(255, 50, 130, 240), outline=(255, 255, 255, 230), width=2)
        draw.text((51, 26), badge_text, fill=(255, 255, 255, 255), font=font_title)
        
        # Top Time Pill
        secs_int = int(t)
        time_text = f"00:{secs_int:02d} / 01:00"
        draw.rounded_rectangle([w - 175, 16, w - 32, 62], radius=14, fill=(18, 12, 32, 220), outline=(255, 160, 210, 200), width=2)
        draw.text((w - 158, 26), time_text, fill=(255, 240, 250, 255), font=font_time)
        
        # Lower-third Caption Box
        cap_x, cap_y = 40, h - 116
        cap_w, cap_h = w - 200, 88
        draw.rounded_rectangle([cap_x, cap_y, cap_x + cap_w, cap_y + cap_h], radius=16, fill=(14, 9, 25, 225), outline=(255, 105, 180, 210), width=2)
        
        wrapped_caption = textwrap.fill(scene["caption"], width=68)
        draw.text((cap_x + 28, cap_y + 16), wrapped_caption, fill=(255, 255, 255, 255), font=font_caption, spacing=6)
        
        # Floating Baby Giggles Avatar
        bob_y = int(math.sin(t * 3.5) * 6.0)
        avatar_x = w - 146
        avatar_y = h - 134 + bob_y
        overlay.paste(avatar_badge, (avatar_x, avatar_y), avatar_badge)
        
        # Composite overlay onto curr_frame
        curr_frame.paste(overlay, (0, 0), overlay)
        
        # Encode Video Frame
        av_frame = av.VideoFrame.from_image(curr_frame)
        for packet in vstream.encode(av_frame):
            container.mux(packet)
            
        if (frame_idx + 1) % 300 == 0 or frame_idx == total_frames - 1:
            fps_speed = (frame_idx + 1) / (time.time() - start_time)
            print(f"Rendered frame {frame_idx + 1}/{total_frames} (Scene {scene_idx + 1}) - Speed: {fps_speed:.1f} fps")

    # Flush video encoder
    for packet in vstream.encode():
        container.mux(packet)
        
    print("Video track finished encoding. Now muxing audio track...")
    
    # 7. Mux Audio Stream
    chunk_size = 1024
    total_audio_samples = audio_stereo.shape[1]
    for i in range(0, total_audio_samples, chunk_size):
        chunk = audio_stereo[:, i:i+chunk_size]
        if chunk.shape[1] < chunk_size:
            pad = np.zeros((2, chunk_size - chunk.shape[1]), dtype=np.float32)
            chunk = np.ascontiguousarray(np.hstack([chunk, pad]))
        else:
            chunk = np.ascontiguousarray(chunk)
        a_frame = av.AudioFrame.from_ndarray(chunk, format='fltp', layout='stereo')
        a_frame.rate = sample_rate
        for packet in astream.encode(a_frame):
            container.mux(packet)
            
    for packet in astream.encode():
        container.mux(packet)
        
    container.close()
    
    # Copy to public folder
    import shutil
    shutil.copyfile(output_mp4, public_mp4)
    
    total_time = time.time() - start_time
    file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
    print(f"SUCCESS! 60s Video generated: {output_mp4} ({file_size_mb:.2f} MB)")
    print(f"Copied to public web folder: {public_mp4}")
    print(f"Total render time: {total_time:.2f}s")

if __name__ == '__main__':
    main()
