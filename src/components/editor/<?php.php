<?php

/**
 *
 * Copyright (C) 2022, Bett Ingenieure GmbH - All Rights Reserved
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Bett Ingenieure GmbH BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

namespace BettIngenieure\ORMFramework\Core\Form\Fields;

use BettIngenieure\ORMFramework\Core\Utilities\DTOs\DirectoryDto;
use BettIngenieure\ORMFramework\Core\Utilities\Encode;
use BettIngenieure\ORMFramework\Core\Utilities\T;

class FolderUploader extends AbstractField
{
    protected array $_acceptedTypes = [];


    public function __construct(string $label, string $name, bool $required)
    {
        $this->_preset('upload', $label, $name, '', $required);

    }


    public function addAcceptedType(string $type): self
    {
        if (str_contains($type, ',') || str_contains($type, ' ')) {
            throw new \RuntimeException('Invalid character within type string');
        }
        $this->_acceptedTypes[] = $type;
        return $this;
    }

    public function getFormEnctype(): string
    {
        return 'multipart/form-data';
    }




    public function fetchValue(array $requestVars): void
    {

        $dirKey = $this->getName() . '__directory_structure';


        $folders = [];
        if (!empty($requestVars[$dirKey])) {
            $rawJson   = $requestVars[$dirKey] ?? '[]';
            $paths     = json_decode($rawJson, true) ?: [];

            foreach ($paths as $idx => $full) {

                $dir  = ltrim(dirname($full), '/\\');
                if ($dir === '.') { $dir = ''; }
                $base = basename($full);

                if (!isset($folders[$dir])) {
                    $folders[$dir] = new DirectoryDto($dir);
                }
                $folders[$dir]->files[] = $base;
            }

        }
        echo '<pre>'.print_r($folders, true).'</pre>';


        if (
            isset($_FILES[$this->getName()]) &&
            $this->validateRequestVar($_FILES[$this->getName()])
        ) {
            $this->_setIsUsed(true);
            //$this->_setValue($_FILES[$this->getName()]);
        } else {
            $this->_setIsUsed(false);
        }

        if (!$this->isUsed() && $this->isRequired()) {
          $this->setHasError(true);
        }
    }


    protected function validateRequestVar(array $inputArray): bool
    {
        if (!isset($inputArray['tmp_name'])) {
            return false;
        }

        if (is_array($inputArray['tmp_name'])) {
            foreach ($inputArray['error'] as $err) {
                if ($err === UPLOAD_ERR_OK) {
                    return true;
                }
            }
            return false;
        }

        return $inputArray['error'] === UPLOAD_ERR_OK
            && trim($inputArray['tmp_name']) !== '';
    }

    protected function getHTMLContainer(): string
    {
        $css = ['file-upload-wrapper', 'folder-upload-wrapper','file-multi-upload-wrapper'];


        $o  = '<div class="' . Encode::htmlEntities(implode(' ', $css)) . '"';
        $o .= ' data-select-title="' . htmlspecialchars($this->getSelectTitle()) . '">';

       $o .= '<input class="form-control" type="file"';

        if ($this->_acceptedTypes !== []) {
            $o .= ' accept="' . Encode::htmlEntities(
                    implode(',', array_map('strtolower', $this->_acceptedTypes))
                ) . '"';
        }


        $o .= ' multiple';


        $o .= ' webkitdirectory directory';

        $name = Encode::htmlEntities($this->getName());

        $o .= ' name="' . $name . '[]"';

        $o .= ' data-existing-files="' . Encode::htmlEntities(
                json_encode($this->getArrayOfExistingFiles())
            ) . '"';

        $o .= ' />';

//TODO: Use Hidden class instead
//        $o .= new Hidden($name . "_paths","[]",true).$this->getHTML();
        $o .= '<input type="hidden" name="' . $name . '__directory_structure" data-paths-input value="" />';

        $o .= $this->renderInner();

        $o .= <<<'SCRIPT'
<script>
(function () {
    var scriptEl =
        document.currentScript ||
        (function () { var s=document.getElementsByTagName('script'); return s[s.length-1]; })();
    if (!scriptEl) return;
    var wrapper = scriptEl.parentElement;
    if (!wrapper) return;

    var input  = wrapper.querySelector('input[type="file"]');
    var hidden = wrapper.querySelector('input[data-paths-input]');
    if (!input || !hidden) return;

    input.addEventListener('change', function (evt) {
        var paths = [];
        for (var i = 0; i < evt.target.files.length; i++) {
            console.log(evt.target.files[i]);
            paths.push(evt.target.files[i].webkitRelativePath || evt.target.files[i].name);
        }
        hidden.value = JSON.stringify(paths);
    });
})();
</script>
SCRIPT;

        $o .= '</div>';

        return $o;
    }




    protected function getArrayOfExistingFiles(): array
    {
        return [];
    }

    protected function renderInner(): string
    {
        return '';
    }

    protected function getSelectTitle(): string
    {
        return T::_(T::NS_FORM_GENERAL, 'Select folder');
    }

    public function getDisplayValue(): ?string
    {
        return null;
    }
}

