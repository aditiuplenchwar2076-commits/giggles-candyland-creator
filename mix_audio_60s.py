import wave
import numpy as np

def create_music_track(duration_sec, sample_rate=44100):
    total_samples = int(duration_sec * sample_rate)
    music = np.zeros(total_samples, dtype=np.float32)
    
    # Pentatonic scale frequencies: C5, D5, E5, G5, A5, C6, D6, E6
    scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51]
    
    melody_pattern = [
        0, 2, 4, 3, 2, 0, 1, 2,
        4, 5, 4, 2, 3, 1, 0, 2,
        3, 4, 5, 7, 5, 4, 3, 2,
        4, 2, 1, 0, 2, 1, 0, 0
    ]
    
    note_duration = 0.40 # seconds per note for 60s pace
    samples_per_note = int(note_duration * sample_rate)
    
    t_note = np.linspace(0, note_duration, samples_per_note, endpoint=False, dtype=np.float32)
    # Bell/music-box envelope: sharp attack, smooth exponential decay
    decay_envelope = np.exp(-t_note * 5.0) * np.sin(np.pi * np.clip(t_note / 0.015, 0, 1))
    
    for i in range(int(duration_sec / note_duration) + 1):
        note_idx = melody_pattern[i % len(melody_pattern)]
        freq = scale[note_idx]
        
        # Fundamental + gentle overtone
        sine = np.sin(2 * np.pi * freq * t_note) * 0.72 + np.sin(2 * np.pi * freq * 2 * t_note) * 0.28
        note_wave = sine * decay_envelope
        
        start_sample = i * samples_per_note
        end_sample = min(start_sample + samples_per_note, total_samples)
        if start_sample < total_samples:
            chunk_len = end_sample - start_sample
            music[start_sample:end_sample] += note_wave[:chunk_len]
            
    # Add gentle bass root notes on each 4-beat bar (1.6s)
    bar_duration = note_duration * 4
    samples_per_bar = int(bar_duration * sample_rate)
    bass_scale = [261.63, 329.63, 392.00, 440.00] # C4, E4, G4, A4
    t_bar = np.linspace(0, bar_duration, samples_per_bar, endpoint=False, dtype=np.float32)
    bass_env = np.exp(-t_bar * 2.0)
    for b in range(int(duration_sec / bar_duration) + 1):
        bfreq = bass_scale[b % len(bass_scale)]
        bwave = (np.sin(2 * np.pi * bfreq * t_bar) * 0.4) * bass_env
        s_s = b * samples_per_bar
        e_s = min(s_s + samples_per_bar, total_samples)
        if s_s < total_samples:
            music[s_s:e_s] += bwave[:e_s - s_s]
            
    # Normalize music volume to peak 0.15
    music = music / (np.max(np.abs(music)) + 1e-6) * 0.14
    return music

def generate_60s_soundtrack(output_wav_path, target_duration=60.0, sample_rate=44100):
    total_samples = int(target_duration * sample_rate)
    speech_track = np.zeros(total_samples, dtype=np.float32)
    
    # Scene timing: 6 scenes of 10.0 seconds each
    scene_start_times = [0.0, 10.0, 20.0, 30.0, 40.0, 50.0]
    
    for i in range(1, 7):
        path = f'D:/pips-dream-studio/scene_{i}_60s.wav'
        with wave.open(path, 'rb') as w:
            src_rate = w.getframerate()
            n_frames = w.getnframes()
            frames = w.readframes(n_frames)
            data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32767.0
            
            # Resample to 44100 if needed
            if src_rate != sample_rate:
                target_len = int(len(data) * sample_rate / src_rate)
                data = np.interp(np.linspace(0, len(data), target_len), np.arange(len(data)), data)
                
            # Place speech with a small 0.15s visual breathing buffer at start of each scene
            start_sec = scene_start_times[i - 1] + 0.15
            start_idx = int(start_sec * sample_rate)
            end_idx = min(start_idx + len(data), total_samples)
            speech_track[start_idx:end_idx] = data[:end_idx - start_idx]
            print(f"Placed Scene {i} speech: {start_sec:.2f}s to {end_idx / sample_rate:.2f}s (duration {len(data)/sample_rate:.2f}s)")
            
    # Generate background music
    music = create_music_track(target_duration, sample_rate)
    
    # Fade out music in the final 1.5 seconds
    fade_len = int(1.5 * sample_rate)
    fade_curve = np.linspace(1.0, 0.0, fade_len, dtype=np.float32)
    music[-fade_len:] *= fade_curve
    
    # Mix speech and music
    mixed = speech_track * 0.95 + music
    mixed = np.clip(mixed, -0.98, 0.98)
    
    # Convert to stereo 16-bit PCM
    int16_mixed = (mixed * 32767).astype(np.int16)
    stereo_mixed = np.column_stack((int16_mixed, int16_mixed))
    
    with wave.open(output_wav_path, 'wb') as out_w:
        out_w.setnchannels(2)
        out_w.setsampwidth(2)
        out_w.setframerate(sample_rate)
        out_w.writeframes(stereo_mixed.tobytes())
        
    print(f"Successfully generated exact 60s soundtrack: {output_wav_path} ({target_duration}s)")
    return target_duration

if __name__ == '__main__':
    generate_60s_soundtrack('D:/pips-dream-studio/final_soundtrack_60s.wav', 60.0)
