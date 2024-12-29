'use client'
/*
	Taken from source code and modified because of the lack of APIs available due to this feature being in beta
	https://github.com/personalizedrefrigerator/js-draw/tree/main/packages/js-draw/src/toolbar/widgets/InsertImageWidget
 */
import {
  ImageComponent,
  Editor,
  Erase,
  EditorImage,
  uniteCommands,
  SelectionTool,
  BaseWidget,
  EditorEventType,
  MutableReactiveValue,
  Command,
  AbstractComponent,
} from 'js-draw'
import { Mat33, Vec2 } from '@js-draw/math'

import type { ToolbarLocalization } from '../../../../../node_modules/js-draw/dist/mjs/toolbar/localization'
import { toolbarCSSPrefix } from '../../../../../node_modules/js-draw/dist/mjs/toolbar/constants'
import makeFileInput from '../../../../../node_modules/js-draw/dist/mjs/toolbar/widgets/components/makeFileInput'
import bytesToSizeString from '../../../../../node_modules/js-draw/dist/mjs/util/bytesToSizeString'
import { ImageWrapper } from '../../../../../node_modules/js-draw/dist/mjs/toolbar/widgets/InsertImageWidget/ImageWrapper'
import makeSnappedList, {
  SnappedListControl,
  SnappedListItem,
} from '../../../../../node_modules/js-draw/dist/mjs/toolbar/widgets/components/makeSnappedList'

import { RenderableImage } from '../../../../../node_modules/js-draw/dist/mjs/rendering/renderers/AbstractRenderer'
import fileToImages from '../../../../../node_modules/js-draw/dist/mjs/toolbar/widgets/InsertImageWidget/fileToImages'

type ImageListItem = SnappedListItem<ImageWrapper | null>

export default class CustomInsertImageWidget extends BaseWidget {
  private images: MutableReactiveValue<ImageListItem[]>
  private imagesPreview!: SnappedListControl<ImageWrapper | null>

  private selectedFiles!: MutableReactiveValue<File[]> | null
  private imageAltTextInput!: HTMLInputElement
  private statusView!: HTMLElement
  private submitButton!: HTMLButtonElement

  public constructor(editor: Editor, localization?: ToolbarLocalization) {
    localization ??= editor.localization

    super(editor, 'insert-image-widget', localization)

    // Make the dropdown showable
    this.container.classList.add('dropdownShowable')

    editor.notifier.on(EditorEventType.SelectionUpdated, (event) => {
      if (
        event.kind === EditorEventType.SelectionUpdated &&
        this.isDropdownVisible()
      ) {
        this.updateInputs()
      }
    })

    this.images = MutableReactiveValue.fromInitialValue<ImageListItem[]>([])
    this.images.onUpdateAndNow(() => {
      this.onImageDataUpdate()
    })
  }

  protected override getTitle(): string {
    return this.localizationTable.image
  }

  protected override createIcon(): Element | null {
    return this.editor.icons.makeInsertImageIcon()
  }

  protected override setDropdownVisible(visible: boolean): void {
    super.setDropdownVisible(visible)

    // Update the dropdown just before showing.
    if (this.isDropdownVisible()) {
      this.updateInputs()
    } else {
      // Allow any previously-selected files to be freed.
      this.selectedFiles?.set([])
    }

    document.getElementById('js-draw-custom-info-message')?.remove()
  }

  protected override handleClick() {
    this.setDropdownVisible(!this.isDropdownVisible())
  }

  private static nextInputId = 0

  protected override fillDropdown(dropdown: HTMLElement): boolean {
    const container = document.createElement('div')
    container.classList.add(
      'insert-image-widget-dropdown-content',
      `${toolbarCSSPrefix}spacedList`,
      `${toolbarCSSPrefix}nonbutton-controls-main-list`,
    )

    const { container: chooseImageRow, selectedFiles } = makeFileInput(
      this.localizationTable.chooseFile,
      this.editor,
      {
        accepts: 'image/*',
        allowMultiSelect: true,
        customPickerAction:
          this.editor.getCurrentSettings().image?.showImagePicker,
      },
    )
    const altTextRow = document.createElement('div')
    this.imagesPreview = makeSnappedList(this.images)
    this.statusView = document.createElement('div')
    const actionButtonRow = document.createElement('div')

    actionButtonRow.classList.add('action-button-row')
    this.statusView.classList.add('insert-image-image-status-view')

    this.submitButton = document.createElement('button')
    this.selectedFiles = selectedFiles
    this.imageAltTextInput = document.createElement('input')

    // Label the alt text input
    const imageAltTextLabel = document.createElement('label')

    const altTextInputId = `insert-image-alt-text-input-${CustomInsertImageWidget.nextInputId++}`
    this.imageAltTextInput.setAttribute('id', altTextInputId)
    imageAltTextLabel.htmlFor = altTextInputId

    imageAltTextLabel.innerText = this.localizationTable.inputAltText
    this.imageAltTextInput.type = 'text'

    this.imageAltTextInput.placeholder = this.localizationTable.describeTheImage

    this.statusView.setAttribute('aria-live', 'polite')

    this.submitButton.innerText = this.localizationTable.submit
    this.imagesPreview.visibleItem.onUpdateAndNow(() =>
      this.onImageDataUpdate(),
    )

    this.imageAltTextInput.oninput = () => {
      const currentImage = this.imagesPreview.visibleItem.get()
      if (currentImage) {
        currentImage.setAltText(this.imageAltTextInput.value)

        this.submitButton.style.display = ''
      }
    }

    this.selectedFiles.onUpdateAndNow(async (files: File[]) => {
      if (files.length === 0) {
        this.images.set([])
        return
      }

      const previews = (
        await Promise.all(
          files.map(
            async (imageFile): Promise<SnappedListItem<ImageWrapper>[]> => {
              let renderableImages: RenderableImage[]
              try {
                renderableImages = await fileToImages(imageFile)
              } catch (error: any) {
                console.error('Image load error', error)

                const errorMessage =
                  this.localizationTable.imageLoadError(error)
                this.statusView.innerText = errorMessage
                return []
              }

              return renderableImages.map((image) => {
                const { wrapper, preview } = ImageWrapper.fromRenderable(
                  image,
                  () => this.onImageDataUpdate(),
                )
                return {
                  data: wrapper,
                  element: preview,
                }
              })
            },
          ),
        )
      ).flat()

      this.images.set(previews)
    })

    altTextRow.replaceChildren(imageAltTextLabel, this.imageAltTextInput)
    actionButtonRow.replaceChildren(this.submitButton)

    container.replaceChildren(
      chooseImageRow,
      altTextRow,
      this.imagesPreview.container,
      this.statusView,
      actionButtonRow,
    )

    dropdown.replaceChildren(container)
    return true
  }

  private onImageDataUpdate() {
    if (!this.imagesPreview) return

    const currentImage = this.imagesPreview.visibleItem.get()
    const base64Data = currentImage?.getBase64Url()

    this.imageAltTextInput.value = currentImage?.getAltText() ?? ''

    if (base64Data) {
      this.submitButton.disabled = false
      this.submitButton.style.display = ''
      this.updateImageSizeDisplay()
    } else {
      this.submitButton.disabled = true
      this.submitButton.style.display = 'none'
      this.statusView.innerText = ''
      this.submitButton.disabled = true
    }

    if (this.images.get().length <= 1) {
      this.submitButton.innerText = this.localizationTable.submit
    } else {
      this.submitButton.innerText = this.localizationTable.addAll
    }
  }

  private hideDialog() {
    this.setDropdownVisible(false)
  }

  private mbToBytes(mb: number) {
    return mb * 1024 * 1024 // Converts MB to bytes
  }

  private calculateResizeFactor(imageFileSizeBytes: number, maxSizeMB = 1) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024 // Convert max size to bytes (1 MB = 1024 * 1024 bytes)

    // If the image is already smaller than the target size, no resizing is needed
    if (imageFileSizeBytes <= maxSizeBytes) {
      return 1 // No resizing needed
    }

    // Calculate the resize factor to achieve the target size
    let resizeFactor = Math.sqrt(maxSizeBytes / imageFileSizeBytes)

    // Ensure the resize factor is less than or equal to 1
    return resizeFactor < 1 ? resizeFactor : 1
  }

  private updateImageSizeDisplay() {
    const currentImage = this.imagesPreview.visibleItem.get()
    const imageData = currentImage?.getBase64Url() ?? ''

    const { size, units } = bytesToSizeString(imageData.length)

    //here
    if (units === 'MiB' && size > 1) {
      currentImage?.decreaseSize(
        this.calculateResizeFactor(this.mbToBytes(size)),
      )
      const infoMessage = document.createElement('em')
      infoMessage.id = 'js-draw-custom-info-message'
      infoMessage.textContent =
        'Notice: The image was bigger than 1mb and was automatically compressed!'

      this.statusView.after(infoMessage)
      this.updateImageSizeDisplay()
      return
    }

    const sizeText = document.createElement('span')
    sizeText.innerText = this.localizationTable.imageSize(
      Math.round(size),
      units,
    )

    // Add a button to allow decreasing the size of large images.
    const decreaseSizeButton = document.createElement('button')
    decreaseSizeButton.innerText = this.localizationTable.decreaseImageSize
    decreaseSizeButton.onclick = () => {
      currentImage?.decreaseSize()
    }

    const resetSizeButton = document.createElement('button')
    resetSizeButton.innerText = this.localizationTable.resetImage
    resetSizeButton.onclick = () => {
      currentImage?.reset()
    }

    this.statusView.replaceChildren(sizeText)

    if (currentImage?.isLarge()) {
      this.statusView.appendChild(decreaseSizeButton)
    } else if (currentImage?.isChanged()) {
      this.statusView.appendChild(resetSizeButton)
    } else {
      const hasLargeOrChangedImages = this.images
        .get()
        .some((image) => image.data?.isChanged() || image.data?.isLarge())
      if (hasLargeOrChangedImages) {
        // Still show the button -- prevents the layout from readjusting while
        // scrolling through the image list
        decreaseSizeButton.disabled = true
        this.statusView.appendChild(decreaseSizeButton)
      }
    }
  }

  private updateInputs() {
    const resetInputs = () => {
      this.selectedFiles?.set([])
      this.imageAltTextInput.value = ''
      this.submitButton.disabled = true
      this.statusView.innerText = ''

      this.submitButton.style.display = ''
    }
    resetInputs()

    const selectionTools =
      this.editor.toolController.getMatchingTools(SelectionTool)
    const selectedObjects = selectionTools
      .map((tool) => tool.getSelectedObjects())
      .flat()

    // Check: Is there a selected image that can be edited?
    let editingImage: ImageComponent | null = null
    if (
      selectedObjects.length === 1 &&
      selectedObjects[0] instanceof ImageComponent
    ) {
      editingImage = selectedObjects[0]

      const image = new Image()
      const imageWrapper = ImageWrapper.fromSrcAndPreview(
        editingImage.getURL(),
        image,
        () => this.onImageDataUpdate(),
      )
      imageWrapper.setAltText(editingImage.getAltText() ?? '')
      this.images.set([{ data: imageWrapper, element: image }])
    } else if (selectedObjects.length > 0) {
      // If not, clear the selection.
      selectionTools.forEach((tool) => tool.clearSelection())
    }

    // Show the submit button only when there is data to submit.
    this.submitButton.style.display = 'none'

    this.submitButton.onclick = async () => {
      const newComponents: AbstractComponent[] = []
      let transform = Mat33.identity
      let fullBBox: any = null

      for (const { data: imageWrapper } of this.images.get()) {
        if (!imageWrapper) {
          continue
        }

        const image = new Image()
        image.src = imageWrapper.getBase64Url()
        const altText = imageWrapper.getAltText()
        if (altText) {
          image.setAttribute('alt', altText)
        }

        let component
        try {
          component = await ImageComponent.fromImage(image, transform)
        } catch (error: any) {
          console.error('Error loading image', error)
          this.statusView.innerText =
            this.localizationTable.imageLoadError(error)
          return
        }

        const componentBBox = component.getBBox()
        if (componentBBox.area === 0) {
          this.statusView.innerText =
            this.localizationTable.errorImageHasZeroSize
          return
        }

        newComponents.push(component)

        fullBBox ??= componentBBox
        if (fullBBox) fullBBox.union(componentBBox)

        // Update the transform for the next item.
        const shift = Vec2.of(0, componentBBox.height)
        transform = transform.rightMul(Mat33.translation(shift))
      }

      if (newComponents.length) {
        if (!fullBBox) {
          throw new Error(
            'Logic error: Full bounding box must be calculated when components are to be added.',
          )
        }
        this.hideDialog()

        if (editingImage) {
          const eraseCommand = new Erase([editingImage])

          // Try to preserve the original width
          const originalTransform = editingImage.getTransformation()
          // || 1: Prevent division by zero
          const originalWidth = editingImage.getBBox().width || 1
          const newWidth =
            fullBBox.transformedBoundingBox(originalTransform).width || 1
          const widthAdjustTransform = Mat33.scaling2D(originalWidth / newWidth)

          const commands: Command[] = []
          for (const component of newComponents) {
            commands.push(
              EditorImage.addElement(component),
              component.transformBy(
                originalTransform.rightMul(widthAdjustTransform),
              ),
              component.setZIndex(editingImage.getZIndex()),
            )
          }

          this.editor.dispatch(uniteCommands([...commands, eraseCommand]))

          selectionTools[0]?.setSelection(newComponents)
        } else {
          await this.editor.addAndCenterComponents(newComponents)
        }
      }
    }
  }
}
