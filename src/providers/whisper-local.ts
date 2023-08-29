import fs from "fs";
import os from "os";
import path from "path";
// CLI
import * as cli from "../cli/ui";
import { execSync } from "child_process";
import { randomUUID } from "crypto";

async function transcribeAudioLocal(audioBuffer: Buffer): Promise<{ text: string; language: string }> {
	// Write audio buffer to tempdir
	const tempdir = os.tmpdir();
	const audioPath = path.join(tempdir, randomUUID() + ".wav");
	fs.writeFileSync(audioPath, audioBuffer);

	// Transcribe + translate audio
	//const output = execSync(`whisper ${audioPath} --model medium --task translate --task transcribe`, { encoding: "utf-8" });
	const transcribeOutput = execSync(`whisper ${audioPath} --model medium --task transcribe`, { encoding: "utf-8" });
	const translateOutput = execSync(`whisper ${audioPath} --model medium --task translate`, { encoding: "utf-8" });

	//Esta variable se queda para la detección de lenguaje.
	const output = `Transcripción>>> ${transcribeOutput}\n\nTraducción>>> ${translateOutput}`

	//Primero hacer el parse:
	const parsedTranscribe = parseTextAfterTimeFrame(transcribeOutput);
	const parsedTranslate = parseTextAfterTimeFrame(translateOutput);
	//Aqui agregamos Transcrpción y Traducción
	const formattedText = `Transcripción: ${parsedTranscribe}\n\nTraducción: ${parsedTranslate}`;
	
	// Delete tmp file
	fs.unlinkSync(audioPath);

	// Delete whisper created tmp files
	const extensions = [".wav.srt", ".wav.txt", ".wav.vtt"];
	for (const extension of extensions) {
		fs.readdirSync(process.cwd()).forEach((file) => {
			if (file.endsWith(extension)) fs.unlinkSync(file);
		});
	}

	// Return parsed text and language
	//cli.print("Output Audio H: " + output);
	return {
		//text: parseTextAfterTimeFrame(output),
		text: formattedText,
		language: parseDetectedLanguage(output)
	};
}

function parseDetectedLanguage(text) {
	const languageLine = text.split("\n")[1]; // Extract the second line of text
	const languageMatch = languageLine.match(/Detected language:\s(.+)/); // Extract the detected language

	if (languageMatch) {
		return languageMatch[1].trim();
	}

	return null; // Return null if match is not found
}

function parseTextAfterTimeFrame(text) {
  const regex = /\[\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}\.\d{3}\]\s(.+)/g;
  const matches = text.match(regex);

  if (matches) {
    return matches.map((match) => match.replace(/\[\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}\.\d{3}\]\s/, '').trim()).join(' ');
  }

  return ""; // Devuelve una cadena vacía si no hay coincidencias
}


export { transcribeAudioLocal };
