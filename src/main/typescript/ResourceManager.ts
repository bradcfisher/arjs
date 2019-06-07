
import { EventDispatcher } from "./EventDispatcher";

/**
 * Metadata related to a resource managed by a ResourceManager.
 */
export class ResourceMeta {

	/**
	 * The URL to retrieve the resource from.
   * @see [[url]]
	 */
	private _url!: string;

	/**
	 * Content type.
   * @see [[type]]
	 */
	private _type: string = "*/*";

	/**
	 * User-friendly description of the content.
   * @see [[description]]
	 */
	private _description: string = "";

// TODO: These properties probably shouldn't be mutable.
	/**
	 * Array of dependency resource names (defaults to an empty array)
	 */
	private _depends: string[] = [];

//"callback": called when this resource and all dependencies complete loading

	/**
	 * The number of bytes of data for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 */
	private _contentLength: number = 0;

	/**
	 * The number of bytes of data that have been loaded for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 */
	private _bytesLoaded: number = 0;

	/**
	 * Constructs a new ResourceMeta instance.
	 *
	 * @param	url			The URL to retrieve the resource from.
	 * @param	type		Content type (defaults to '* /*')
	 * @param	description	User-friendly description of the content (defaults to empty string)
	 * @param	depends		Array of dependency resource names (defaults to an empty array)
	 */
	constructor(url: string, type?: string, description?: string, depends?: string[]) {
		this.url = url;

		if (type != null)
			this.type = type;

		if (description != null)
			this.description = description;

		if (depends != null)
			this.depends = depends;
	} // constructor

  /**
	 * Retrieves the URL to retrieve the resource from.
	 * @return	The URL to retrieve the resource from.
	 */
  get url(): string {
    return this._url;
	}

	/** @internal */
	set url(value : string) {
		this._url = value;
	}

	/**
	 * Retrieves the content type of the resource.
	 * @return	The content type of the resource.
	 */
	get type(): string {
    return this._type;
  }

	/** @internal */
	set type(value : string) {
		this._type = value;
	}

  /**
	 * Retrieves the user-friendly description of the content.
   * @return The user-friendly description of the content.
	 */
	get description(): string {
		return this._description;
	}

	/** @internal */
	set description(value : string) {
		this._description = value;
	}

  /**
	 * Retrieves the array of dependency resource names.
   * @return The array of dependency resource names.
	 */
	get depends(): string[] {
		return this._depends;
	}

	/** @internal */
	set depends(value: string[]) {
		this._depends = value;
	}

	/**
	 * Retrieves the number of bytes of data for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 * @return The number of bytes of data for this resource.
	 */
	get contentLength(): number {
		return this._contentLength;
	}

	/** @internal */
	set contentLength(value: number) {
		this._contentLength = value;
	}

	/**
	 * Retrieves the number of bytes of data that have been loaded for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 * @return The number of bytes of data that have been loaded for this resource.
	 */
	get bytesLoaded(): number {
		return this._bytesLoaded;
	}

	/** @internal */
	set bytesLoaded(value: number) {
		this._bytesLoaded = value;
	}

} // ResourceMeta

/**
 * Resource entry in a ResourceManager.
 */
export class ResourceEntry {
	private _meta: ResourceMeta;
	private _data: any;

	/**
	 * Constructs a new ResourceEntry.
	 *
	 * @param	meta	The ResourceMeta associated with the entry.
	 * @param	data	The data associated with the entry.
	 */
	constructor(meta: ResourceMeta, data: any) {
		this._meta = meta;
		this._data = data;
	}

	/**
	 * Retrieves the `data` property.
	 * @return	The value of the `data` property.
	 */
	get data(): any {
		return this._data;
	}

	/**
	 * Retrieves the `meta` property.
	 * @return	The value of the `meta` property.
	 */
	get meta(): ResourceMeta {
		return this._meta;
	}
} // ResourceEntry

/**
 * Manages a pool of external resources, providing facilities to asynchronously load and .
 *
 * Events:
 *  - progress		Sent periodically while loading resource data.
 *						lengthComputable - Whether the expected content length is known.
 *						loaded - Number of bytes loaded so far.
 *						total - Total number of bytes for the resource.
 *						May only be guaranteed to be sent at the start of a load operation and when the load completes.
 *  - complete		Sent when all currently loading resources have completed or failed.
 *  - load			Sent when a resource load operation completes successfully.
 *  - error			Sent when a resource load operation fails.
 */
export class ResourceManager
	extends EventDispatcher
{
	/**
	 * The resource decoder functions that are currently registered.
	 *
	 * Entries in this map are keyed on content type, with more specific matches being chosen if
	 * multiple possibilities exist.  For example, if there is are entries for both 'application/*'
	 * and 'application/json', the 'application/json' entry will be chosen when a resource is
	 * loaded with that exact type, but the 'application/*' entry will be chosen for other types
	 * in the 'application/*' category.
	 */
	private _decoders: { [type:string] : ResourceManager.ResourceDecoder };

	/**
	* The list of entries currently loaded and managed by this ResourceManager.
	*/
	private _entries: ResourceManager.ResourceEntryMap = {};

	/**
	 * The number of bytes of data for all resources.
	 */
	private _contentLength: number = 0;

	/**
	 * The number of bytes of data that have been loaded for all resources.
	 */
	private _bytesLoaded: number = 0;

	/**
	 * The current number of active (started, but not yet completed) resource load operations.
	 */
	private _numLoading: number = 0;

	constructor() {
		super();
		this._decoders = {
				'*/*' : this.decodeArrayBuffer,
				'audio/*' : this.decodeAudioResource,
				'image/*' : this.decodeImageResource,
				'text/*' : this.decodeTextResource,
				'application/javascript' : this.decodeJavaScriptResource,
				'application/json' : this.decodeJsonResource
			};
	} // constructor

	/**
	 * Retrieves the current number of active (started, but not yet completed) resource
	 * load operations.
	 *
	 * @return	The current number of active (started, but not yet completed) resource
	 * 			load operations.
	 */
	get numLoading(): number {
		return this._numLoading;
	} // numLoading

	/**
	 * Retrieves the number of bytes of data for all resources.
	 * Note that this size may not be 100% accurate until all load operations have completed.
	 *
	 * @return	The number of bytes of data for all resources.
	 */
	get contentLength(): number {
		return this._contentLength;
	} // contentLength

	/**
	 * Retrieves the number of bytes of data that have been loaded for all resources.
	 * Note that this size may not be 100% accurate until all load operations have completed.
	 *
	 * @return	The number of bytes of data that have been loaded for all resources.
	 */
	get bytesLoaded(): number {
		return this._bytesLoaded;
	} // bytesLoaded

	/**
	 * Loads a single resource described by a ResourceMeta instance.
	 *
	 * @param	source	The ResourceMeta describing the resource to load.
	 *
	 * @return	A promise which will complete with the loaded resource entry if successful.
	 */
	private loadOne(source: ResourceMeta): Promise<ResourceEntry> {
		let url: string = source.url;

		// Load a single resource
		if (this._entries.hasOwnProperty(url)) {
console.log("requested resource already known: ", source);
			// Resource data already loaded, simply return it
			return new Promise<ResourceEntry>((accept, reject) => {
					accept(this._entries[url]);
				});
		} else {
console.log("loading single resource: ", source);

// TODO: Implement dependencies

			// Resource data not known yet, make a network request to retrieve it
			return new Promise<ResourceEntry>((accept, reject) => {
				let wrappedReject = (error: Error) => {
					--this._numLoading;
					this._contentLength -= source.contentLength;
					this._bytesLoaded -= source.bytesLoaded;
					reject(error);
				};

				++this._numLoading;

				let request: XMLHttpRequest = new XMLHttpRequest();
				request.open('GET', url);
				request.responseType = 'arraybuffer';
				request.onload = (evt: ProgressEvent) => {
					if (request.status == 200) {
						this.decodeResource(
							request,
							source,
							(value) => {
								this._contentLength -= source.contentLength;
								this._bytesLoaded -= source.bytesLoaded;
								source.contentLength = evt.loaded;
								source.bytesLoaded = evt.loaded;
								this._contentLength += source.contentLength;
								this._bytesLoaded += source.bytesLoaded;
								--this._numLoading;

								this.trigger('load');

// TODO: Deal with race condition when multiple loads of same resource occur before the first one completes...

								let entry: ResourceEntry = new ResourceEntry(source, value);
								this._entries[url] = entry;
								accept(entry);
							},
							wrappedReject
						);
					} else {
						let error: Error = new Error(request.status +" "+ request.statusText);
						this.trigger('error', error);
						wrappedReject(error);
					}
				};
				request.onerror = (evt) => {
					let error: Error = new Error(request.statusText + ": "+ source.url);
					this.trigger('error', error);
					wrappedReject(error);
				};
				request.onabort = (evt) => {
					let error: Error = new Error("Aborted retrieval of resource: "+ source.url);
					this.trigger('error', error);
					wrappedReject(error);
				};
				request.onprogress = (evt) => {
					if (evt.lengthComputable) {
						if (source.contentLength == 0) {
							source.contentLength = evt.total;
							this._contentLength += evt.total;
						} else {
							this._bytesLoaded -= source.bytesLoaded;
						}
						source.bytesLoaded = evt.loaded;
						this._bytesLoaded += source.bytesLoaded;
					}

					this.trigger('progress', {
						loaded: this.bytesLoaded,
						total: this.contentLength
					});
				};
				request.send();
			});
		}
	} // loadOne

	/**
	 * Starts loading one or more resources into this ResourceManager.
	 *
	 * @param	source	A URL string, ResourceMeta instance, or array of URL string(s) or
	 *					ResourceMeta instances which identify the resource(s) to load.
	 *
	 * @return	A Promise which will complete with a map of the loaded resource entries on
	 *			completion.
	 */
	load(...sources: (string|ResourceMeta)[]): Promise<ResourceManager.ResourceEntryMap> {
		let promises: Promise<ResourceEntry>[] = [];

		for (let source of sources) {
			let src: ResourceMeta = (
				(source instanceof ResourceMeta)
					? source as ResourceMeta
					: new ResourceMeta(source)
			);

			promises.push(this.loadOne(src));
		}

		return new Promise<ResourceManager.ResourceEntryMap>((accept, reject) => {
			Promise.all(promises).then(
				(entries: ResourceEntry[]) => {
					let successfulByUrl: ResourceManager.ResourceEntryMap = {};

					for (let entry of entries) {
						successfulByUrl[entry.meta.url] = entry;
					}

					accept(successfulByUrl);
				},
				(error: Error) => {
					reject(error);
				}

			);
		});
	} // load

	private getContentType(request: XMLHttpRequest): string {
		let contentType: string|null = request.getResponseHeader("Content-Type");
		return (contentType != null ? contentType : 'application/octet-stream');
	} // getContentType

	private getResourceDecoder(contentTypePieces: string[]): ResourceManager.ResourceDecoder {
		let decoder: ResourceManager.ResourceDecoder|undefined;

		decoder = this._decoders[contentTypePieces[0] +'/'+ contentTypePieces[1]];
		if (decoder == null) {
			decoder = this._decoders[contentTypePieces[0] +'/*'];

			if (decoder == null) {
				decoder = this._decoders['*/*'];

				if (decoder == null) {
					decoder = this.decodeArrayBuffer;
				}
			}
		}

		return (decoder as ResourceManager.ResourceDecoder);
	} // getResourceDecoder

	private decodeResource(
		request: XMLHttpRequest,
		meta: ResourceMeta,
		accept: ((resource:any) => void),
		reject: ((error:Error) => void)
	) {
		let contentType: string = this.getContentType(request);

		// Remove parameters
		contentType = contentType.replace('\s*;.*$', '');

		if (meta.type == '*/*')
			meta.type = contentType;

		// Split into separate components and retrieve appropriate decoder
		let decoder: ResourceManager.ResourceDecoder = this.getResourceDecoder(contentType.split('/'));
		decoder.call(this, request, meta, accept, reject);
	} // decodeResource

	private decodeArrayBuffer(
		request: XMLHttpRequest,
		meta: ResourceMeta,
		accept: ((resource:any) => void),
		reject: ((error:Error) => void)
	) {
		accept(request.response);
	} // decodeArrayBuffer

	private decodeAudioResource(
		request: XMLHttpRequest,
		meta: ResourceMeta,
		accept: ((resource:any) => void),
		reject: ((error:Error) => void)
	) {
/*
			this.audioContext.decodeAudioData(request.response, (buffer) => {
				accept(buffer);
			});
*/
		this.decodeArrayBuffer(request, meta, accept, reject);
	} // decodeAudioResource

	private decodeImageResource(
		request: XMLHttpRequest,
		meta: ResourceMeta,
		accept: ((resource:any) => void),
		reject: ((error:Error) => void)
	) {
		let blob: Blob = new Blob([ new Uint8Array(request.response) ], {type:meta.type});

		let imageUrl = window.URL.createObjectURL( blob );
		let img: HTMLImageElement = document.createElement('img');
		img.addEventListener('load', (e) => {
			accept(img);
		});
		img.addEventListener('error', (e) => {
			reject(new Error("Unable to load image resource: "+ meta.url));
		});
		img.src = imageUrl;
	} // decodeImageResource

	private decodeTextResource(
		request: XMLHttpRequest,
		meta: ResourceMeta,
		accept: ((resource:any) => void),
		reject: ((error:Error) => void)
	) {
		try {
			let blob: Blob = new Blob([new Uint8Array(request.response)], {type:'text/plain'});
			let reader: FileReader = new FileReader();
			reader.addEventListener("loadend", (e) => {
				accept(reader.result);
			});
			reader.addEventListener("abort", (e) => {
				reject(new Error("Load aborted for: "+ meta.url));
			});
			reader.addEventListener("error", (e) => {
				let name = (reader.error ? reader.error.name : null);
				if (!name)
					name = "<unknown error type>";
				reject(new Error(name +": "+ meta.url));
			});
			reader.readAsText(blob, 'utf-8');
		} catch (e) {
			reject(e);
		}
	} // decodeTextResource

	private decodeJavaScriptResource(
		request: XMLHttpRequest,
		meta: ResourceMeta,
		accept: ((resource:any) => void),
		reject: ((error:Error) => void)
	) {
		this.decodeTextResource(request, meta, accept, reject);
	} // decodeJavaScriptResource

	private decodeJsonResource(
		request: XMLHttpRequest,
		meta: ResourceMeta,
		accept: ((resource:any) => void),
		reject: ((error:Error) => void)
	) {
		this.decodeTextResource(
			request,
			meta,
			(text) => {
				try {
					accept(JSON.parse(text));
				} catch (e) {
					reject(e);
				}
			},
			reject
		);
	} // decodeJsonResource

	getEntryUrls(): string[] {
		let urls: string[] = [];
		for (let url in this._entries) if (this._entries.hasOwnProperty(url))
			urls.push(url);
		return urls;
	} // getEntryUrls

	getEntry(url: string): ResourceEntry|null {
		return this._entries[url];
	} // getEntry

	get(url: string): any {
		let entry: ResourceEntry|null = this.getEntry(url);
		if (entry != null)
			return entry.data;
		return undefined;
	} // get
} // ResourceManager


export module ResourceManager {

	/**
	 * A map of resource URL string to ResourceEntry instance associated with that URL.
	 */
	export type ResourceEntryMap = { [url:string]: ResourceEntry };

	export type ResourceDecoder =
		(
			request: XMLHttpRequest,
			meta: ResourceMeta,
			accept: ((resource:any) => void),
			reject: ((error:Error) => void)
		) => void;

}

