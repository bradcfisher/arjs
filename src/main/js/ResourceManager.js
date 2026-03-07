
import { EventDispatcher } from "./EventDispatcher.js";

/**
 * Metadata related to a resource managed by a ResourceManager.
 */
export class ResourceMeta {

	/**
	 * The URL to retrieve the resource from.
	 * @type {string|undefined}
	 */
	#url;

	/**
	 * Content type.
	 * @type {string}
	 */
	#type = "*/*";

	/**
	 * User-friendly description of the content.
     * @type {string}
	 */
	#description = "";

// TODO: These properties probably shouldn't be mutable.
	/**
	 * Array of dependency resource names (defaults to an empty array)
	 * @type {string[]}
	 */
	#depends = [];

//"callback": called when this resource and all dependencies complete loading

	/**
	 * The number of bytes of data for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 * @type {number}
	 */
	#contentLength = 0;

	/**
	 * The number of bytes of data that have been loaded for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 * @type {number}
	 */
	#bytesLoaded = 0;

	/**
	 * Constructs a new ResourceMeta instance.
	 *
	 * @param {string} url The URL to retrieve the resource from.
	 * @param {string|undefined} type Content type (defaults to '* /*')
	 * @param {string} description User-friendly description of the content (defaults to empty string)
	 * @param {string[]} depends Array of dependency resource names (defaults to an empty array)
	 */
	constructor(url, type = '*/*', description = '', depends = []) {
		this.url = url;

		if (type != null)
			this.type = type;

		if (description != null)
			this.description = description;

		if (depends != null)
			this.depends = depends;
	}

	/**
	 * Retrieves the URL to retrieve the resource from.
	 * @return The URL to retrieve the resource from.
	 */
	get url() {
		return this.#url;
	}

	/** @internal */
	set url(value) {
		this.#url = value;
	}

	/**
	 * Retrieves the content type of the resource.
	 * @return The content type of the resource.
	 */
	get type() {
		return this.#type;
	}

	/** @internal */
	set type(value) {
		this.#type = value;
	}

  /**
	 * Retrieves the user-friendly description of the content.
	 * @return The user-friendly description of the content.
	 */
	get description() {
		return this.#description;
	}

	/** @internal */
	set description(value) {
		this.#description = value;
	}

  /**
	 * Retrieves the array of dependency resource names.
	 * @return The array of dependency resource names.
	 */
	get depends() {
		return this.#depends;
	}

	/** @internal */
	set depends(value) {
		this.#depends = value;
	}

	/**
	 * Retrieves the number of bytes of data for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 * @return The number of bytes of data for this resource.
	 */
	get contentLength() {
		return this.#contentLength;
	}

	/** @internal */
	set contentLength(value) {
		this.#contentLength = value;
	}

	/**
	 * Retrieves the number of bytes of data that have been loaded for this resource.
	 * Automatically updated by the ResourceManager as the load operation progresses.
	 * @return The number of bytes of data that have been loaded for this resource.
	 */
	get bytesLoaded() {
		return this.#bytesLoaded;
	}

	/** @internal */
	set bytesLoaded(value) {
		this.#bytesLoaded = value;
	}

} // ResourceMeta

/**
 * Resource entry in a ResourceManager.
 */
export class ResourceEntry {

	/**
	 * Constructs a new ResourceEntry.
	 *
	 * @param {ResourceMeta} meta The ResourceMeta associated with the entry.
	 * @param {*} data The data associated with the entry.
	 */
	constructor(meta, data) {
		/**
		 * @type {ResourceMeta}
		 */
		this.meta = meta;
		this.data = data;
	}

} // ResourceEntry

/**
 * Manages a pool of external resources, providing facilities to asynchronously load and dispatch events
 * when they are available.
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
	 * @type {{ [type:string] : (request: XMLHttpRequest, meta: ResourceMeta, accept: (resource:any) => void, reject: (error:Error) => void) => void }}
	 */
	#decoders;

	/**
	* The list of entries currently loaded and managed by this ResourceManager.
	* A map of resource URL string to ResourceEntry instance associated with that URL.
	* @type {{ [url:string]: ResourceEntry }}
	*/
	#entries = {};

	/**
	 * The number of bytes of data for all resources.
	 * @type {number}
	 */
	#contentLength = 0;

	/**
	 * The number of bytes of data that have been loaded for all resources.
	 * @type {number}
	 */
	#bytesLoaded = 0;

	/**
	 * The current number of active (started, but not yet completed) resource load operations.
	 * @type {number}
	 */
	#numLoading = 0;

	constructor() {
		super();
		this.#decoders = {
				'*/*' : this.#decodeArrayBuffer,
				'audio/*' : this.#decodeAudioResource,
				'image/*' : this.#decodeImageResource,
				'text/*' : this.#decodeTextResource,
				'application/javascript' : this.#decodeJavaScriptResource,
				'application/json' : this.#decodeJsonResource
			};
	}

	/**
	 * Retrieves the current number of active (started, but not yet completed) resource
	 * load operations.
	 *
	 * @return	The current number of active (started, but not yet completed) resource
	 * 			load operations.
	 */
	get numLoading() {
		return this.#numLoading;
	}

	/**
	 * Retrieves the number of bytes of data for all resources.
	 * Note that this size may not be 100% accurate until all load operations have completed.
	 *
	 * @return	The number of bytes of data for all resources.
	 */
	get contentLength() {
		return this.#contentLength;
	}

	/**
	 * Retrieves the number of bytes of data that have been loaded for all resources.
	 * Note that this size may not be 100% accurate until all load operations have completed.
	 *
	 * @return	The number of bytes of data that have been loaded for all resources.
	 */
	get bytesLoaded() {
		return this.#bytesLoaded;
	}

	/**
	 * Loads a single resource described by a ResourceMeta instance.
	 *
	 * @param {ResourceMeta} source The ResourceMeta describing the resource to load.
	 *
	 * @return {Promise<ResourceEntry>} A promise which will complete with the loaded resource entry if successful.
	 */
	#loadOne(source) {
		const url = source.url;

		// Load a single resource
		if (this.#entries.hasOwnProperty(url)) {
console.log("requested resource already known: ", source);
			// Resource data already loaded, simply return it
			return new Promise<ResourceEntry>((accept, reject) => {
					accept(this.#entries[url]);
				});
		} else {
console.log("loading single resource: ", source);

// TODO: Implement dependencies

			// Resource data not known yet, make a network request to retrieve it
			return new Promise((accept, reject) => {
				const wrappedReject = (error) => {
					--this.#numLoading;
					this.#contentLength -= source.contentLength;
					this.#bytesLoaded -= source.bytesLoaded;
					reject(error);
					console.error("checking complete for ", source, " after error", error);
					this.#checkComplete();
				};

				++this.#numLoading;

				const request = new XMLHttpRequest();
				request.open('GET', url);
				request.responseType = 'arraybuffer';
				request.onload = (evt) => {
					if (request.status == 200) {
						this.#decodeResource(
							request,
							source,
							(value) => {
								this.#contentLength -= source.contentLength;
								this.#bytesLoaded -= source.bytesLoaded;
								source.contentLength = evt.loaded;
								source.bytesLoaded = evt.loaded;
								this.#contentLength += source.contentLength;
								this.#bytesLoaded += source.bytesLoaded;
								--this.#numLoading;

								this.triggerEvent('load');

// TODO: Deal with race condition when multiple loads of same resource occur before the first one completes...

								const entry = new ResourceEntry(source, value);
								this.#entries[url] = entry;
								accept(entry);
								this.#checkComplete();
							},
							wrappedReject
						);
					} else {
						const error = new Error(request.status +" "+ request.statusText);
						this.triggerEvent('error', error);
						wrappedReject(error);
					}
				};
				request.onerror = (evt) => {
					const error = new Error(request.statusText + ": "+ source.url);
					console.error("Sending error for source ", source, " event: ", error);
					this.triggerEvent('error', error);
					wrappedReject(error);
				};
				request.onabort = (evt) => {
					const error = new Error("Aborted retrieval of resource: "+ source.url);
					this.triggerEvent('error', error);
					wrappedReject(error);
				};
				request.onprogress = (evt) => {
					if (evt.lengthComputable) {
						if (source.contentLength == 0) {
							source.contentLength = evt.total;
							this.#contentLength += evt.total;
						} else {
							this.#bytesLoaded -= source.bytesLoaded;
						}
						source.bytesLoaded = evt.loaded;
						this.#bytesLoaded += source.bytesLoaded;
					}

					this.triggerEvent('progress', {
						loaded: this.bytesLoaded,
						total: this.contentLength
					});
				};
				request.send();
			});
		}
	}

	#checkComplete() {
		if (this.#numLoading == 0) {
			this.triggerEvent('complete', {
						loaded: this.bytesLoaded,
						total: this.contentLength
					});
		}
	}

	/**
	 * Starts loading one or more resources into this ResourceManager.
	 *
	 * @param {(string|ResourceMeta)[]} source A URL string, ResourceMeta instance, or array of URL string(s) or
	 *					ResourceMeta instances which identify the resource(s) to load.
	 *
	 * @return {Promise<{ [url:string]: ResourceEntry }>} A Promise which will complete with a map of the
	 *         loaded resource entries on completion.
	 */
	load(...sources) {
		const promises = [];

		for (let source of sources) {
			const src =
				(source instanceof ResourceMeta)
					? source
					: new ResourceMeta(source);

			promises.push(this.#loadOne(src));
		}

		return new Promise((accept, reject) => {
			Promise.all(promises).then(
				(entries) => {
					/** @type {{ [url:string]: ResourceEntry }} */
					const successfulByUrl = {};

					for (let entry of entries) {
						successfulByUrl[entry.meta.url] = entry;
					}

					accept(successfulByUrl);
				},
				(error) => {
					reject(error);
				}

			);
		});
	}

	/**
	 * Determines the Content-Type of the response, defaulting to
	 * `application/octet-stream` if not available.
	 *
	 * @param {XMLHttpRequest} request the XMLHttpRequest object to determine the content type for.
	 * @return {string} the content type determined for the request.
	 */
	#getContentType(request) {
		let contentType = request.getResponseHeader("Content-Type");
		return (contentType != null ? contentType : 'application/octet-stream');
	}

	/**
	 * Determines the decoder method to use for a resource based on a content type.
	 *
	 * @param {string[]} contentTypePieces the separate portions of the content type.
	 * @return {(request: XMLHttpRequest, meta: ResourceMeta, accept: (resource:any) => void, reject: (error:Error) => void) => void}
	 *         a function to be used to decode a resource of the specified type.
	 */
	#getResourceDecoder(contentTypePieces) {
		/** @type {(request: XMLHttpRequest, meta: ResourceMeta, accept: (resource:any) => void, reject: (error:Error) => void) => void|undefined} */
		let decoder;

		decoder = this.#decoders[contentTypePieces[0] +'/'+ contentTypePieces[1]];
		if (decoder == null) {
			decoder = this.#decoders[contentTypePieces[0] +'/*'];

			if (decoder == null) {
				decoder = this.#decoders['*/*'];

				if (decoder == null) {
					decoder = this.#decodeArrayBuffer;
				}
			}
		}

		return decoder;
	}

	/**
	 * Decodes retrieved resource data based on its content type.
	 *
	 * @param {XMLHttpRequest} request the completed request containing the response data.
	 * @param {ResourceMeta} meta resource meta object describing the resource.
	 * @param {(resource:any) => void} accept callback function to invoke on success.  The decoded data
	 * 				is passed as an argument to this callback.
	 * @param {(error:Error) => void} reject callback function to invoke on failure.  The error, if any,
	 * 				is passed as an argument to this callback.
	 */
	#decodeResource(request, meta, accept, reject) {
		let contentType = this.#getContentType(request);

		// Remove parameters
		contentType = contentType.replace('\s*;.*$', '');

		if (meta.type == '*/*') {
			meta.type = contentType;
		}

		// Split into separate components and retrieve appropriate decoder
		const decoder = this.#getResourceDecoder(contentType.split('/'));
		console.log("Decoding resource ", request.responseURL, " of type ", contentType, " with decoder ", decoder);
		decoder.call(this, request, meta, accept, reject);
	}

	/**
	 * Decodes a retrieved resource as a plain ArrayBuffer.
	 *
	 * @param {XMLHttpRequest} request the completed request containing the response data.
	 * @param {ResourceMeta} meta resource meta object describing the resource.
	 * @param {(resource:any) => void} accept callback function to invoke on success.  The decoded data
	 * 				is passed as an argument to this callback.
	 * @param {(error:Error) => void} reject callback function to invoke on failure.  The error, if any,
	 * 				is passed as an argument to this callback.
	 */
	#decodeArrayBuffer(request, meta, accept, reject) {
		accept(request.response);
	}

	/**
	 * Decodes a retrieved resource as an AudioClip.
	 * TODO: This doesn't actually do that, it's an alias for #decodeArrayBuffer.  To implement this better in the future, should probably implement a way to register new content type decoders so ResourceManager doesn't need to know about audio clips.
	 *
	 * @param {XMLHttpRequest} request the completed request containing the response data.
	 * @param {ResourceMeta} meta resource meta object describing the resource.
	 * @param {(resource:any) => void} accept callback function to invoke on success.  The decoded data
	 * 				is passed as an argument to this callback.
	 * @param {(error:Error) => void} reject callback function to invoke on failure.  The error, if any,
	 * 				is passed as an argument to this callback.
	 */
	#decodeAudioResource(request, meta, accept, reject) {
/*
			this.audioContext.decodeAudioData(request.response, (buffer) => {
				accept(buffer);
			});
*/
		this.#decodeArrayBuffer(request, meta, accept, reject);
	}

	/**
	 * Decodes a retrieved resource as an image.
	 *
	 * @param {XMLHttpRequest} request the completed request containing the response data.
	 * @param {ResourceMeta} meta resource meta object describing the resource.
	 * @param {(resource:any) => void} accept callback function to invoke on success.  The decoded data
	 * 				is passed as an argument to this callback.
	 * @param {(error:Error) => void} reject callback function to invoke on failure.  The error, if any,
	 * 				is passed as an argument to this callback.
	 */
	#decodeImageResource(request, meta, accept, reject) {
		const blob = new Blob([ new Uint8Array(request.response) ], {type:meta.type});

		let imageUrl = window.URL.createObjectURL( blob );

		const img = new Image();
        // Only add the image to the map after it's loaded
        img.addEventListener('load', (e) => {
			const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			accept(ctx.getImageData(0, 0, canvas.width, canvas.height));
			/*
            createImageBitmap(img, 0, 0, img.naturalWidth, img.naturalHeight)
                .then((imageData) => {
                    accept(imageData);
                });
			*/
        });
		img.addEventListener('error', (e) => {
			reject(new Error("Unable to load image resource: "+ meta.url));
		});
		img.src = imageUrl;
	}

	/**
	 * Decodes a retrieved resource as plain text.
	 *
	 * @param {XMLHttpRequest} request the completed request containing the response data.
	 * @param {ResourceMeta} meta resource meta object describing the resource.
	 * @param {(resource:any) => void} accept callback function to invoke on success.  The decoded data
	 * 				is passed as an argument to this callback.
	 * @param {(error:Error) => void} reject callback function to invoke on failure.  The error, if any,
	 * 				is passed as an argument to this callback.
	 */
	#decodeTextResource(request, meta, accept, reject) {
		try {
			const blob = new Blob([new Uint8Array(request.response)], {type:'text/plain'});
			const reader = new FileReader();
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
	}

	/**
	 * Decodes a retrieved resource as Javascript code.
	 * TODO: Currently, this is a simple wrapper around #decodeTextResource.  May want to consider creating a script tag to load the resource so it's executable with fewer restrictions?
	 *
	 * @param {XMLHttpRequest} request the completed request containing the response data.
	 * @param {ResourceMeta} meta resource meta object describing the resource.
	 * @param {(resource:any) => void} accept callback function to invoke on success.  The decoded data
	 * 				is passed as an argument to this callback.
	 * @param {(error:Error) => void} reject callback function to invoke on failure.  The error, if any,
	 * 				is passed as an argument to this callback.
	 */
	#decodeJavaScriptResource(request, meta, accept, reject) {
		this.#decodeTextResource(request, meta, accept, reject);
	}

	/**
	 * Decodes a retrieved resource as JSON data.
	 *
	 * @param {XMLHttpRequest} request the completed request containing the response data.
	 * @param {ResourceMeta} meta resource meta object describing the resource.
	 * @param {(resource:any) => void} accept callback function to invoke on success.  The decoded data
	 * 				is passed as an argument to this callback.
	 * @param {(error:Error) => void} reject callback function to invoke on failure.  The error, if any,
	 * 				is passed as an argument to this callback.
	 */
	#decodeJsonResource(request, meta, accept, reject) {
		this.#decodeTextResource(
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
	}

	/**
	 * Retrieves an array of the URLs for all the currently managed resource entries.
	 * @return {string[]} array of resource URLs.
	 */
	#getEntryUrls() {
		const urls = [];
		for (let url in this.#entries) if (this.#entries.hasOwnProperty(url))
			urls.push(url);
		return urls;
	}

	/**
	 * Retrieves the ResourceEntry for a previously loaded resource URL.
	 *
	 * @param {string} url the URL of the resource to retrieve the resource entry data for.
	 * @return {ResourceEntry|null} the resource entry for the specified URL, or undefined if
	 * 		no resource with that URL.
	 */
	getEntry(url) {
		return this.#entries[url];
	}

	/**
	 * Retrieves the decoded data for a previously loaded resource URL.
	 *
	 * @param {string} url the URL of the resource to retrieve the data for.
	 * @return {*} the resource data for the specified URL, or undefined if
	 * 		no resource with that URL.
	 */
	get(url) {
		const entry = this.getEntry(url);
		if (entry != null)
			return entry.data;
		return undefined;
	}

} // ResourceManager
